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
                cartResult = await pool.query('INSERT INTO carts (user_id,created_at) VALUES ($1,$2) RETURNING id', [userId,dateOfNow]);
            }
            cartId = cartResult.rows[0].id;

        } else if (guestToken) {
            let cartResult = await pool.query('SELECT id FROM carts WHERE guest_token = $1', [guestToken]);
            if (cartResult.rows.length === 0) {
                // Sepet yoksa oluştur ve ID'sini al
                cartResult = await pool.query('INSERT INTO carts (guest_token,created_at) VALUES ($1,$2) RETURNING id', [guestToken,dateOfNow]);
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
            DO UPDATE SET quantity = cart_items.quantity + 1;
        `;
        // Tek sorguda ürünü ekliyor, eğer zaten o sepette o ürün varsa sayısını 1 artırıyor.
        await pool.query(upsertItemQuery, [cartId, productId]);

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
            cartCount: parseInt(totalCount, 10) 
        });

    } catch (err) {
        console.error("Sepete ekleme hatası:", err);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
};

const getCartPage = async (req,res) =>{
    // Kart itemlerini al ve bir listeye at.

    // Render
    res.render("./pages/cart", {title: "Sepetim"/*, cartItems*/ })
}
module.exports = {
    addItemToCart,
    getCartPage
}