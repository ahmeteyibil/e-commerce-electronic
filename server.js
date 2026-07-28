const express = require('express');
const path = require('path');
const pool = require('./db'); // Veritabanı bağlantısını dahil ettik
const pg = require('pg')
const app = express();
const PORT = 3000; // veya doğrudan 3000

// View Engine olarak EJS'yi seçiyoruz
app.set('view engine', 'ejs');

// Statik dosyaların (CSS, resimler vb.) yeri
app.use(express.static(path.join(__dirname, 'public')));


// Ana sayfa route'u
app.get('/', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('index', { 
        title: 'Ana Sayfa'
    });
});
app.get("/products", async (req,res) => {
    
    try {
        // PostgreSQL'den ürünleri çekiyoruz
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        const products = result.rows; // Çekilen ürünler dizisi

        res.render('products', { 
            title: 'E-Ticaret Projem',
            products: products // Ürünleri EJS dosyasına yolluyoruz
        });
    } catch (err) {
        console.error('Veritabanı hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
})

app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor: http://localhost:3000');
});