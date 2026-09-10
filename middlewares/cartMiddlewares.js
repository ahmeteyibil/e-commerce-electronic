const pool = require('../db');
const { getCartIdByCartItemId , getCartIdByUserId} = require('../services/cartService');
const getCartItemCount = async (req, res, next) => {
    try {
        let totalCount = 0;

        // 1. Kullanıcı giriş yapmış mı yoksa misafir mi kontrol edelim
        const userId = req.user ? req.user.id : null;
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
const cartItemUpdateAuthorize = async (req,res,next) =>{
    const { cartItemId } = req.body;

    const cartId = await getCartIdByCartItemId(cartItemId);

    const userId = req.user ? req.user.id : null;
    const guestToken = req.guestToken;
    
    const userCartId = await getCartIdByUserId(userId);
    const guestCartId = await getCartIdByUserId(userId);

    // cartId'nin şu anki kullanıcıya ait olup olmadığı kontrolü
    if (userId && userCartId != cartId) {
        return res.status(403).json({
            success: false,
            message: `Yetkisiz erişim. user'ın cartId'si: ${userCartId}, item'in cartId'si: ${cartId}`
        })
    }
    else if (guestToken && guestCartId != cartId) {
        return res.status(403).json({
            success: false,
            message: `Yetkisiz erişim. guest'in cartId'si: ${guestCartId}, item'in cartId'si: ${cartId}`
        })
    }
    next();
}
module.exports = {
    getCartItemCount,
    cartItemUpdateAuthorize
}