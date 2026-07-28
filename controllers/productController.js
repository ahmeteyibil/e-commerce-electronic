const pool = require('../db');

// Ana sayfa ürünlerini getiren fonksiyon
const getProductPage = async (req,res) => {
    try {
        // PostgreSQL'den ürünleri çekiyoruz
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        const products = result.rows; // Çekilen ürünler dizisi

        res.render('pages/products', { 
            title: 'E-Ticaret Projem',
            products: products // Ürünleri EJS dosyasına yolluyoruz
        });
    } catch (err) {
        console.error('Veritabanı hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
};

module.exports = {
    getProductPage
};