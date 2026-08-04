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

const decreaseQuantityFromCart = async (req, res) => {
    console.log("decreaseQuantityFromCart() worked.")
    const { cartItemId } = req.body;

    // Mevcut quantity bilgisini al, eğer 0'dan büyükse devam et. Değilse çalıştırma.
    const currentQuantityResult = await pool.query("SELECT quantity from cart_items WHERE id = $1", [cartItemId]);
    const currentQuantity = currentQuantityResult.rows[0].quantity;
    if (currentQuantity <= 0) {
        console.log("Decrease işlemi yapılamaz. Mevcut miktar 0'dan küçük veya eşit.");
        return;
    }
    let decreaseQuery = 'UPDATE cart_items SET quantity = ($1 - 1) WHERE id = $2 RETURNING quantity';
    try {
        const result = await pool.query(decreaseQuery, [currentQuantity, cartItemId]);
        if (result.rowCount > 0) {
            console.log("Karttaki item sayısı başarıyla 1 düşürüldü");
            const newQuantity = result.rows[0].quantity;
            const cartIdQuery = "SELECT cart_id from cart_items WHERE id = $1";
            const cartIdResults = await pool.query(cartIdQuery, [cartItemId]);
            const cartId = cartIdResults.rows[0].cart_id;
            const countQuery = `SELECT SUM(quantity) as total FROM cart_items WHERE cart_id = $1`;
            const countResult = await pool.query(countQuery, [cartId]);
            const totalCount = countResult.rows[0].total;
            res.json({
                success: true,
                message: "Ürün miktarı başarıyla azaltildi.",
                newQuantity: newQuantity,
                cartCount: totalCount
            });
        }
        else {
            console.log("Decrease işlemi yapılamadı. rowCount <= 0")
        }
    } catch (err) {
        console.log("Item decrease sırasında hata oluştu:", err.message);
    }
}

const increaseQuantityFromCart = async (req, res) => {
    console.log("increaseQuantityFromCart() worked.")
    const { cartItemId } = req.body;

    // Şu anki quantity stok sayısına eşit veya büyük ise, fonksiyonu bitir. Arttırma yapma.

    let increaseQuery = 'UPDATE cart_items SET quantity = (quantity + 1) WHERE id = $1 RETURNING quantity';
    try {
        const increaseResult = await pool.query(increaseQuery, [cartItemId]);
        if (increaseResult.rowCount > 0) {
            const newQuantity = increaseResult.rows[0].quantity;
            
            // Karttaki toplam item sayısını hesapla.
            const cartIdQuery = "SELECT cart_id from cart_items WHERE id = $1";
            const cartIdResults = await pool.query(cartIdQuery, [cartItemId]);
            const cartId = cartIdResults.rows[0].cart_id;
            console.log("Increase yapılan cartId: ", cartId);
            const countQuery = `SELECT SUM(quantity) as total FROM cart_items WHERE cart_id = $1`;
            const countResult = await pool.query(countQuery, [cartId]);
            const totalCount = countResult.rows[0].total;

            res.json({
                success: true,
                message: "Ürün miktarı başarıyla artırıldı.",
                newQuantity: newQuantity,
                cartCount: totalCount
            });
        }
        else {
            console.log("Increase işlemi yapılamadı. rowCount <= 0")
        }
    } catch (err) {
        console.log("Item Increase sırasında hata oluştu:", err.message);
    }
}

module.exports = {
    addItemToCart,
    getCartPage,
    decreaseQuantityFromCart,
    increaseQuantityFromCart
}