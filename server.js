const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const pool = require('./db'); // Veritabanı bağlantısını dahil ettik
const pg = require('pg')
const productRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const app = express();
const PORT = 3000; // veya doğrudan 3000
// View Engine olarak EJS'yi seçiyoruz
app.set('view engine', 'ejs');

// Statik dosyaların (CSS, resimler vb.) yeri
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
// Formdan gelen URL-encoded verileri okuyabilmek için:
app.use(express.urlencoded({ extended: true }));
// Eğer JSON verisi alacaksan:
app.use(express.json());
app.set('layout', 'layouts/main');
// Ana sayfa route'u
app.get('/', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('pages/index', {
        title: 'Ana Sayfa'
    });
});
app.use('/', productRoutes); // Ana dizin altındaki tüm istekleri productRoutes yönetir
app.use('/', authRoutes); // Ana dizin altındaki tüm istekleri productRoutes yönetir
app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor: http://localhost:3000');
});