const pool = require('../db');
const { getProductInfos, getProductImages, getShopInfoForProduct } = require('../services/productService');
// Ana sayfa ürünlerini getiren fonksiyon
const getTrendsPage = async (req, res) => {
    try {
        const query = `
        SELECT 
            p.*,
            pi.image_url AS primary_image_url
        FROM products p
        LEFT JOIN product_images pi
            ON pi.product_id = p.id
            AND pi.is_primary = true
        ORDER BY p.id ASC
        `;
        // PostgreSQL'den ürünleri çekiyoruz
        const result = await pool.query(query);
        const products = result.rows; // Çekilen ürünler dizisi

        res.render('pages/trend-products', {
            title: 'Ürünler',
            products: products // Ürünleri EJS dosyasına yolluyoruz
        });
    } catch (err) {
        console.error('Veritabanı hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
};

const getProductPage = async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
        return res.status(400).send('Geçersiz ürün ID');
    }

    const productInfos = await getProductInfos(id);
    const productImages = await getProductImages(id);
    console.log("Ürün resimleri: ", productImages);
    const productShopInfos = await getShopInfoForProduct(id);
    if (!productInfos) {
        return res.status(404).send('Ürün bulunamadı');
    }
    res.render('pages/product', { title: 'Ürün: ', product: productInfos, productImages: productImages, shopName: productShopInfos.shop_name });
};


// YARDIMCI FONKSİYONLAR:


module.exports = {
    getTrendsPage,
    getProductPage
};