const pool = require('../db')

const getProductInfos = async (productId) => {
    const query = "SELECT * from products WHERE id = $1";
    let product;
    try {
        const result = await pool.query(query, [productId]);
        if (result.rowCount > 0) {
            product = result.rows[0];
        }
        else {
            product = null;
        }
    } catch (err) {
        console.log("ID ile ürün bilgisi çekilirken hata: ", err.message);
    }
    return product;
}

const getProductImages = async (productId) => {
    const query = "SELECT * from product_images WHERE product_id = $1";
    let images = {
        primary: null,
        extras: []
    };
    try {
        const result = await pool.query(query, [productId]);
        if (result.rowCount > 0) {
            for (const img of result.rows) {
                if (img.is_primary) {
                    images.primary = img;
                }
                else {
                    images.extras.push(img);
                }
            }
        }
    } catch (err) {
        console.log("ID ile ürün resimleri çekilirken hata: ", err.message);
    }
    return images;
}

const getShopInfoForProduct = async (productId) => {
    try {
        let shopInfos;
        const shopIdQuery = "SELECT shop_id from products WHERE id = $1";
        const shopIdResult = await pool.query(shopIdQuery, [productId]);
        if (shopIdResult.rowCount == 0) {
            console.log("productId ile shop bilgileri getirilirken hata oluştu. shopId bulunamadı");
            return {};
        }
        const shopId = shopIdResult.rows[0].shop_id;
        const shopQuery = "SELECT * from shops WHERE id = $1";
        const shopResult = await pool.query(shopQuery, [shopId]);
        shopInfos = shopResult.rows[0];
        return shopInfos;
    } catch (err) {
        console.log("ID ile ürün bilgisi çekilirken hata: ", err.message);
        return {};
    }
}

module.exports = {
    getProductInfos,
    getProductImages,
    getShopInfoForProduct
}