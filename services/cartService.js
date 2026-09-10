const pool = require('../db');
const getCartIdByUserId = async function (userId) {
    const query = "SELECT id from carts WHERE user_id = $1";
    try {
        const response = await pool.query(query, [userId]);
        return response.rows[0].id;
    } catch (err) {
        console.log("Veritabanından userId'ye göre cartId çekilirken hata oluştu: ", err.message);
        return null;
    }
}
const getCartIdByGuestToken = async function (guestToken) {
    const query = "SELECT id from carts WHERE guest_token = $1";
    try {
        const response = await pool.query(query, [guestToken]);
        return response.rows[0].id;
    } catch (err) {
        console.log("Veritabanından guestToken'a göre cartId çekilirken hata oluştu: ", err.message);
        return null;
    }
}
const getCartIdByCartItemId = async function (cartItemId) {
    const query = "SELECT cart_id from cart_items WHERE id = $1";
    try {
        const response = await pool.query(query, [cartItemId]);
        if (response.rowCount <= 0) return null;
        return response.rows[0].cart_id;
    } catch (err) {
        console.log("Veritabanından cartItemId'ye göre cartId çekilirken hata oluştu: ", err.message);
        return null;
    }
}
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
module.exports = {
    getCartIdByUserId,
    getCartIdByGuestToken,
    getCartIdByCartItemId,
    getCartStatus
}