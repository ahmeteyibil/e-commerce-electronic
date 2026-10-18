const pool = require('../db');
const { getProductInfos, getProductImages, getShopInfoForProduct, getAllProducts } = require('../services/productService');
// Ana sayfa ürünlerini getiren fonksiyon
const getTrendsPage = async (req, res) => {
    try {
        const products = await getAllProducts();

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
    const slug = req.params.slug;
    const idxOfSeperator = slug.lastIndexOf("_");
    const idStr = slug.slice(idxOfSeperator+1);
    const id = Number.parseInt(idStr, 10);
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