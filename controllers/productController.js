const pool = require('../db');

// Ana sayfa ürünlerini getiren fonksiyon
const getTrendsPage = async (req, res) => {
    try {
        // PostgreSQL'den ürünleri çekiyoruz
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
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
    const id = req.params.id; // :id
    console.log("Bilgileri çekilip product.ejs'e yollanacak product'ın id'si: ", id);
    const productInfos = await getProductById(id);
    console.log(productInfos.name);
    res.render('pages/product', { title: 'Ürün: ', product: productInfos });
};


// YARDIMCI FONKSİYONLAR:

const getProductById = async (productId) => {
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
module.exports = {
    getTrendsPage,
    getProductPage
};