const pool = require('../db');

const getShopByUserId = async (userId) => {
    const query = "SELECT id, shop_name FROM shops WHERE user_id = $1";
    try {
        const response = await pool.query(query, [userId]);

        if (response.rowCount === 0) {
            return null;
        }

        return {
            shopId: response.rows[0].id,
            shopName: response.rows[0].shop_name
        };
    } catch (err) {
        console.log("Mağaza bilgisi veritabanından çekilirken hata oluştu: ", err.message);
        return null;
    }

};

const getShopProductsById = async (shopId) => {
    const query = "SELECT * from products WHERE shop_id = $1";
    try {
        const response = await pool.query(query, [shopId]);
        if (response.rowCount === 0) {
            return null;
        }
        const products = response.rows;
        return products;
    } catch (err) {
        console.log("Mağazanın ürünleri veritabanından çekilirken bir hata oluştu");
    }

}

module.exports = {
    getShopProductsById,
    getShopByUserId
};
