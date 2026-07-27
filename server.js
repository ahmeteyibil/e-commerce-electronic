const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // veya doğrudan 3000

// View Engine olarak EJS'yi seçiyoruz
app.set('view engine', 'ejs');

// Statik dosyaların (CSS, resimler vb.) yeri
app.use(express.static(path.join(__dirname, 'public')));

products = [
    {
        name : "Kulaklık",
        stokCode : 1000,
        price : 1400
    },
    {
        name : "3'lü priz",
        stokCode : 1001,
        price : 500
    },
    {
        name : "Robot süpürge",
        stokCode : 1002,
        price : 25000
    }
]

// Ana sayfa route'u
app.get('/', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('index', { 
        title: 'Ahmet Elektronik | Ana Sayfa',
        products 
    });
});

app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor: http://localhost:3000');
});