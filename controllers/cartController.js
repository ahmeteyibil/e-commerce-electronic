const pool = require('../db')

const addItemToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user ? req.session.user.id : null;
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
            VALUES ($1, $2, 1)
            ON CONFLICT (cart_id, product_id) 
            DO UPDATE SET quantity = (cart_items.quantity + 1) RETURNING quantity;
        `;
        // Tek sorguda ürünü ekliyor, eğer zaten o sepette o ürün varsa sayısını 1 artırıyor.
        const upsertResult = await pool.query(upsertItemQuery, [cartId, productId]);
        const { newQuantity } = upsertResult.rows[0];
        // ==========================================
        // 3. ADIM: GÜNCEL SEPET SAYISINI HESAPLA (Header için)
        // ==========================================
        const countQuery = `
            SELECT SUM(quantity) as total 
            FROM cart_items 
            WHERE cart_id = $1
        `;
        const countResult = await pool.query(countQuery, [cartId]);
        const totalCount = countResult.rows[0].total;

        // Frontend'e başarı durumunu ve yeni sepet sayısını JSON olarak dön
        res.json({
            success: true,
            message: "Ürün başarıyla eklendi.",
            cartCount: parseInt(totalCount, 10),
            newQuantity: newQuantity
        });

    } catch (err) {
        console.error("Sepete ekleme hatası:", err);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
};

const getCartPage = async (req, res) => {
    // Kart itemlerini al ve bir listeye at.
    const userId = req.session.user ? req.session.user.id : null;
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
        if (getCartIdQuery !== "") {
            const cartIdResults = await pool.query(getCartIdQuery, parameters);
            var cartItemsWithProduct;
            const { id } = cartIdResults.rows[0];
            console.log("İtemleri çekilecek olan sepetin id'si: ", id);
            let getItemsQuery = "SELECT row_to_json(ci) AS cart_item, row_to_json(p) AS product FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1";
            const results = await pool.query(getItemsQuery, [id]);
            cartItemsWithProduct = results.rows;

        }
        res.render("./pages/cart", { title: "Sepetim", cartItemsWithProduct: cartItemsWithProduct })
    } catch (er) {
        console.log("Sepet verileri çekilirken hata oluştu: ", er.message);
        res.status(500);
    }

}

const decreaseQuantity = async (req, res) => {
    console.log("decreaseQuantityFromCart() worked.")
    const { cartItemId } = req.body;

    // Mevcut quantity bilgisini al, eğer 1'den büyükse devam et. Değilse çalıştırma.
    const currentQuantityResult = await pool.query("SELECT quantity from cart_items WHERE id = $1", [cartItemId]);
    const currentQuantity = currentQuantityResult.rows[0].quantity;
    if (currentQuantity <= 1) {
        console.log("Decrease işlemi yapılamaz. Mevcut miktar 0'dan küçük veya eşit.");
        return;
    }
    let decreaseQuery = 'UPDATE cart_items SET quantity = ($1 - 1) WHERE id = $2 RETURNING quantity';
    try {
        const result = await pool.query(decreaseQuery, [currentQuantity, cartItemId]);
        if (result.rowCount > 0) {
            console.log("Karttaki item sayısı başarıyla 1 düşürüldü");
            const newQuantity = result.rows[0].quantity;
            const cartId = await getCartIDFromCartItemID(cartItemId);
            // const totalCount = await calculateTotalCartCount(cartId);

            const cartStatus = await getCartStatus(cartId);
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

    // Şu anki quantity stok sayısına eşit veya büyük ise, fonksiyonu bitir. Arttırma yapma.

    let increaseQuery = 'UPDATE cart_items SET quantity = (quantity + 1) WHERE id = $1 RETURNING quantity';
    try {
        const increaseResult = await pool.query(increaseQuery, [cartItemId]);
        if (increaseResult.rowCount > 0) {
            // Yeni miktar
            const newQuantity = increaseResult.rows[0].quantity;
            // CartID'yi al
            const cartId = await getCartIDFromCartItemID(cartItemId);
            console.log("Increase yapılan cartId: ", cartId);
            // Karttaki toplam miktarı hesapla.
            // const totalCount = await calculateTotalCartCount(cartId);

            const cartStatus = await getCartStatus(cartId);
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
    const removeQuery = "DELETE from cart_items WHERE id = $1";
    try {
        // Önce cartID'yi alıyoruz. Çünkü sildikten sonra alamayız.
        const cartId = await getCartIDFromCartItemID(cartItemId);
        // Silme işlemi
        const removeResults = await pool.query(removeQuery, [cartItemId]);
        const isRemoved = removeResults.rowCount > 0;
        // Yeni sepet bilgileri.
        const cartStatus = await getCartStatus(cartId);

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

// YARDIMCI FONKSİYONLAR
// const calculateTotalCartCount = async (cartID) => {
//     const countQuery = `SELECT SUM(quantity) as total FROM cart_items WHERE cart_id = $1`;
//     try {
//         const countResult = await pool.query(countQuery, [cartID]);
//         const totalCount = parseInt(countResult.rows[0].total, 10) || 0;
//         return totalCount;
//     } catch (er) {
//         console.log("Karttaki ürün sayısı hesaplanırken hata oluştu: ", er.message)
//         return -1;
//     }
// }
const getCartStatus = async (cartID) => {
    // Sepetin güncel durumunu hesaplayan tek bir harika sorgu:
    const cartStatusQuery = `SELECT SUM(ci.quantity) as total_items, SUM(ci.quantity * p.price) as total_cost FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1`;

    try {
        const cartStatusResult = await pool.query(cartStatusQuery, [cartID]);
        const cartTotalCount = parseInt(cartStatusResult.rows[0].total_items, 10) || 0;
        const cartTotalCost = parseInt(cartStatusResult.rows[0].total_cost, 10) || 0;
        return { cartTotalCount, cartTotalCost };
    } catch (er) {
        console.log("Karttaki ürün sayısı hesaplanırken hata oluştu: ", er.message)
        return -1;
    }
}
const getCartIDFromCartItemID = async (cartItemID) => {
    const cartIdQuery = "SELECT cart_id from cart_items WHERE id = $1";
    try {
        const cartIdResults = await pool.query(cartIdQuery, [cartItemID]);
        const cartId = cartIdResults.rows[0].cart_id;
        return cartId;
    } catch (er) {
        console.log("Karttaki ürün sayısı hesaplanırken hata oluştu: ", er.message)
        return -1;
    }
}
module.exports = {
    addItemToCart,
    getCartPage,
    decreaseQuantity,
    increaseQuantity,
    removeItem
}