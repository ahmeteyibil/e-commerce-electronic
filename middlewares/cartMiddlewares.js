const pool = require('../db')
const getCartItemCount = async (req, res, next) => {
    try {
        let totalCount = 0;

        // 1. Kullanıcı giriş yapmış mı yoksa misafir mi kontrol edelim
        const userId = req.session.user ? req.session.user.id : null;
        const guestToken = req.guestToken; // Önceki adımda oluşturduğumuz çerez token'ı

        let queryStr = "";
        let params = [];

        if(userId){
            queryStr = "SELECT SUM(ci.quantity) as total FROM carts c JOIN cart_items ci ON c.id = ci.cart_id WHERE c.user_id = $1";
            params = [userId];
        }
        else if(guestToken){
            queryStr = "SELECT SUM(ci.quantity) as total FROM carts c JOIN cart_items ci ON c.id = ci.cart_id WHERE c.guest_token = $1";
            params = [guestToken];
        }
        if(queryStr){
            const result = await pool.query(queryStr,params);
            totalCount = result.rows[0].total || 0;
        }
        res.locals.cartItemCount = parseInt(totalCount, 10);
        next();
    } catch (err) {
        console.error("Sepet sayısı hesaplanırken hata oluştu:", err.message);
        res.locals.cartItemCount = 0; // Hata durumunda site çökmesin, 0 yazsın
        next();
    }
}

module.exports = {
    getCartItemCount
}