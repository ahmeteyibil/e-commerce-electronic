const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const pool = require('./db'); // Veritabanı bağlantısını dahil ettik
const session = require('express-session');
const pg = require('pg')

const cookieParser = require('cookie-parser')
const {getCartItemCount} = require('./middlewares/cartMiddlewares')
const {trySetQuestToken} = require('./middlewares/authMiddlewares')

const cartRoutes = require('./routes/cartRoutes')
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
app.use(cookieParser());
app.use(session({
    secret: 'cok-gizli-bir-anahtar-kelime', // Oturum verilerini imzalamak için kullanılır
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Canlı ortamda (HTTPS) true olmalıdır
        httpOnly: true, // XSS (Cross-Site Scripting) saldırılarını önler; JavaScript çerezlere erişemez
        maxAge: 1000 * 60 * 60 * 24 // Oturumun açık kalacağı süre (Örn: 1 gün)
    }
}));

app.set('layout', 'layouts/main');

app.use(trySetQuestToken);

app.use(getCartItemCount);

// Her sayfadan önce çalışıp oturum açan kullanıcıyı EJS'e aktarır
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});



// Ana sayfa route'u
app.get('/', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('pages/index', {
        title: 'Ana Sayfa'
    });
});
app.use('/cart', cartRoutes)
app.use('/', productRoutes); // Ana dizin altındaki tüm istekleri productRoutes yönetir
app.use('/', authRoutes); // Ana dizin altındaki tüm istekleri productRoutes yönetir

app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor: http://localhost:3000');
});