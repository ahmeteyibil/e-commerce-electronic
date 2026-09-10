const pool = require('../db')
const cartService = require('../services/cartService');

const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (quantity <= 0) {
            return res.json({
                success: false,
                message: "Sepete ürün ekleme başarısız: Eklenecek ürün sayısı 0'dan büyük olmalıdır."
            })
        }
        const userId = req.user ? req.user.id : null;
        const guestToken = req.guestToken;

        let cartId;

        // ==========================================
        // 1. ADIM: SEPETİ BUL VEYA OLUŞTUR
        // (Bu işlem bir kullanıcı/misafir için sadece 1 kez çalışır)
        // ==========================================
        const dateOfNow = new Date();
        if (userId) {
            let cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);

            if (cartResult.rows.length === 0) {
                // Sepet yoksa oluştur ve ID'sini al
                cartResult = await pool.query('INSERT INTO carts (user_id,created_at) VALUES ($1,$2) RETURNING id', [userId, dateOfNow]);
            }
            cartId = cartResult.rows[0].id;

        } else if (guestToken) {
            let cartResult = await pool.query('SELECT id FROM carts WHERE guest_token = $1', [guestToken]);
            if (cartResult.rows.length === 0) {
                // Sepet yoksa oluştur ve ID'sini al
                cartResult = await pool.query('INSERT INTO carts (guest_token,created_at) VALUES ($1,$2) RETURNING id', [guestToken, dateOfNow]);
            }
            cartId = cartResult.rows[0].id;
        }

        // ==========================================
        // 2. ADIM: ÜRÜNÜ EKLE VEYA MİKTARINI ARTIR
        // (Asıl performans kazancı sağlayan ON CONFLICT yapısı)
        // ==========================================
        const upsertItemQuery = `
            INSERT INTO cart_items (cart_id, product_id, quantity) 
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, product_id) 
            DO UPDATE SET quantity = (cart_items.quantity + $3) RETURNING quantity;
        `;
        // Tek sorguda ürünü ekliyor, eğer zaten o sepette o ürün varsa sayısını 1 artırıyor.
        const upsertResult = await pool.query(upsertItemQuery, [cartId, productId, quantity]);
        const { newQuantity } = upsertResult.rows[0];
        // ==========================================
        // 3. ADIM: GÜNCEL SEPET SAYISINI HESAPLA (Header için)
        // ==========================================
        const cartStatus = await cartService.getCartStatus(cartId);
        const totalCount = cartStatus.cartTotalCount;

        // const productQuery = "SELECT * as product from products WHERE id = $1";
        // const productResults = await pool.query(productQuery, [productId]);
        // const product = productResults.rows[0].product;

        // Frontend'e başarı durumunu ve yeni sepet sayısını JSON olarak dön
        res.json({
            success: true,
            message: "Ürün başarıyla eklendi.",
            cartCount: parseInt(totalCount, 10),
            newQuantity: newQuantity,
        });

    } catch (err) {
        console.error("Sepete ekleme hatası:", err);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
};

const getCartPage = async (req, res) => {
    // 1. karttaki ürünleri alır.
    // 2. kartın toplam maliyetini hesaplar.

    const userId = req.user ? req.user.id : null;
    const guestToken = req.guestToken ? req.guestToken : null;

    let getCartIdQuery = "";
    let parameters = []
    if (userId) {
        getCartIdQuery = "SELECT id from carts WHERE user_id = $1";
        parameters = [userId];
    }
    else if (guestToken) {
        getCartIdQuery = "SELECT id from carts WHERE guest_token = $1";
        parameters = [guestToken];
    }
    try {
        let cartTotalCount;
        let cartTotalCost;
        if (getCartIdQuery !== "") {
            const cartIdResults = await pool.query(getCartIdQuery, parameters);
            var cartItemsWithProduct;
            if (cartIdResults.rowCount < 0) {
                cartItemsWithProduct = null;
            }
            const { id } = cartIdResults.rows[0];
            console.log("İtemleri çekilecek olan sepetin id'si: ", id);
            // Sepetteki itemleri çek
            let getItemsQuery = "SELECT row_to_json(ci) AS cart_item, row_to_json(p) AS product FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1";
            const itemResults = await pool.query(getItemsQuery, [id]);
            cartItemsWithProduct = itemResults.rows;
            // Sepetin toplam maliyetini ve sepetteki item sayısını çek.
            const cartStatus = await cartService.getCartStatus(id);
            cartTotalCount = cartStatus.cartTotalCount;
            cartTotalCost = cartStatus.cartTotalCost;
        }
        res.render("./pages/cart", { title: "Sepetim", cartItemsWithProduct: cartItemsWithProduct, totalCount: cartTotalCount, totalCost: cartTotalCost })
    } catch (er) {
        console.log("Sepet verileri çekilirken hata oluştu: ", er.message);
        res.status(500);
    }

}

const decreaseQuantity = async (req, res) => {
    const { cartItemId } = req.body;
    const userId = req.user ? req.user.id : null;
    const guestToken = req.guestToken;

    try {
        const currentItemResult = await pool.query("SELECT quantity, cart_id from cart_items WHERE id = $1", [cartItemId]);
        const currentQuantity = currentItemResult.rows[0].quantity; // Stok miktarı kontrolü yapılacak.
        if (currentQuantity <= 1) {
            return res.status(405).json({
                success: false,
                message: "Ürün miktarı daha fazla azaltılamaz."
            });
        }

        let decreaseQuery;
        let parameters;
        if (userId) {
            decreaseQuery = `UPDATE cart_items AS ci SET quantity = ci.quantity - 1 FROM carts AS c WHERE ci.id = $1 AND ci.cart_id = c.id AND c.user_id = $2 RETURNING ci.quantity, ci.cart_id`;
            parameters = [cartItemId, userId];
        }
        else if (guestToken) {
            decreaseQuery = `UPDATE cart_items AS ci SET quantity = ci.quantity - 1 FROM carts AS c WHERE ci.id = $1 AND ci.cart_id = c.id AND c.guest_token = $2 RETURNING ci.quantity, ci.cart_id`;
            parameters = [cartItemId, guestToken];
        }
        const result = await pool.query(decreaseQuery, parameters);
        if (result.rowCount > 0) {
            console.log("Karttaki item sayısı başarıyla 1 düşürüldü");
            const newQuantity = result.rows[0].quantity;
            // CartID'yi al
            const cartId = result.rows[0].cart_id;
            const cartStatus = await cartService.getCartStatus(cartId);
            // Tıklanan o spesifik ürünün kendi güncel toplamını da bulalım
            const itemCostQuery = `SELECT (ci.quantity * p.price) as item_total FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1`;
            const itemCostResult = await pool.query(itemCostQuery, [cartItemId]);
            const itemCost = itemCostResult.rows[0].item_total;
            res.json({
                success: true,
                message: "Ürün miktarı başarıyla azaltildi.",
                newQuantity: newQuantity,
                cartCount: cartStatus.cartTotalCount,
                cartCost: cartStatus.cartTotalCost,
                itemCost: itemCost
            });
        }
        else {
            console.log("Decrease işlemi yapılamadı. rowCount <= 0")
        }
    } catch (err) {
        console.log("Item decrease sırasında hata oluştu:", err.message);
        res.status(500);
    }
}

const increaseQuantity = async (req, res) => {
    console.log("increaseQuantityFromCart() worked.")
    const { cartItemId } = req.body;

    const userId = req.user ? req.user.id : null;
    const guestToken = req.guestToken;

    const actor = getCartActor(req);
    try {
        // Şu anki quantity stok sayısına eşit veya büyük ise, fonksiyonu bitir. Arttırma yapma.
        const currentItemResult = await pool.query("SELECT quantity, cart_id from cart_items WHERE id = $1", [cartItemId]);
        const currentQuantity = currentItemResult.rows[0].quantity; // Stok miktarı kontrolü yapılacak.

        let increaseQuery;
        let parameters;
        if (userId) {
            increaseQuery = `UPDATE cart_items AS ci SET quantity = ci.quantity + 1 FROM carts AS c WHERE ci.id = $1 AND ci.cart_id = c.id AND c.user_id = $2 RETURNING ci.quantity, ci.cart_id`;
            parameters = [cartItemId, userId];
        }
        else if (guestToken) {
            increaseQuery = `UPDATE cart_items AS ci SET quantity = ci.quantity + 1 FROM carts AS c WHERE ci.id = $1 AND ci.cart_id = c.id AND c.guest_token = $2 RETURNING ci.quantity, ci.cart_id`;
            parameters = [cartItemId, guestToken];
        }

        const increaseResult = await pool.query(increaseQuery, parameters);
        if (increaseResult.rowCount > 0) {
            // Yeni miktar
            const newQuantity = increaseResult.rows[0].quantity;
            // CartID'yi al
            const cartId = increaseResult.rows[0].cart_id;
            const cartStatus = await cartService.getCartStatus(cartId);
            // Tıklanan o spesifik ürünün kendi güncel toplamını da bulalım
            const itemCostQuery = `SELECT (ci.quantity * p.price) as item_total FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1`;
            const itemCostResult = await pool.query(itemCostQuery, [cartItemId]);
            const itemCost = itemCostResult.rows[0].item_total;

            res.json({
                success: true,
                message: "Ürün miktarı başarıyla artırıldı.",
                newQuantity: newQuantity,
                cartCount: cartStatus.cartTotalCount,
                cartCost: cartStatus.cartTotalCost,
                itemCost: itemCost
            });
        }
        else {
            console.log("Increase işlemi yapılamadı. rowCount <= 0")
        }
    } catch (err) {
        console.log("Item Increase sırasında hata oluştu:", err.message);
        res.status(500);
    }
}
const removeItem = async (req, res) => {
    const { cartItemId } = req.body;
    const userId = req.user ? req.user.id : null;
    const guestToken = req.guestToken;

    try {
        let removeQuery;
        let parameters;

        if (userId) {
            removeQuery = `
                    DELETE FROM cart_items AS ci
                    USING carts AS c
                    WHERE ci.id = $1
                      AND ci.cart_id = c.id
                      AND c.user_id = $2
                    RETURNING ci.cart_id
                `;
            parameters = [cartItemId, userId];
        } else if (guestToken) {
            removeQuery = `
                    DELETE FROM cart_items AS ci
                    USING carts AS c
                    WHERE ci.id = $1
                      AND ci.cart_id = c.id
                      AND c.guest_token = $2
                    RETURNING ci.cart_id
                `;
            parameters = [cartItemId, guestToken];
        } else {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı doğrulanamadı.'
            });
        }

        const removeResults = await pool.query(removeQuery, parameters);
        if (removeResults.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'Sepet ürünü bulunamadı veya yetkiniz yok.'
            });
        }

        const cartId = removeResults.rows[0].cart_id;
        // Yeni sepet bilgileri.
        const cartStatus = await cartService.getCartStatus(cartId);

        res.json({
            success: true,
            message: `${cartItemId} id'sine sahip ürün sepetten silindi.`,
            cartCount: cartStatus.cartTotalCount,
            cartCost: cartStatus.cartTotalCost
        });
    } catch (err) {
        console.log("Sepetten ürün silinirken hata oluştu: ", err.message)
        res.status(500);
    }
}

// Yardımcı fonksiyonlar

const getCartActor = (req) => ({
    userId: req.session.user ? req.session.user.id : null,
    guestToken: req.guestToken || null
});

module.exports = {
    addItemToCart,
    getCartPage,
    decreaseQuantity,
    increaseQuantity,
    removeItem
}