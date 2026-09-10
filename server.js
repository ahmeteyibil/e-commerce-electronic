require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const pool = require('./db'); // Veritabanı bağlantısını dahil ettik
const session = require('express-session');
const pg = require('pg')
const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser')
const { getCartItemCount } = require('./middlewares/cartMiddlewares')
const { trySetGuestToken, requireAuth } = require('./middlewares/authMiddlewares')

const cartRoutes = require('./routes/cartRoutes')
const productRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const shopRoutes = require('./routes/shopRoutes');
const accountRoutes = require('./routes/accountRoutes');
const app = express();

const PORT = process.env.PORT;


app.set('views', path.join(__dirname, 'views'));
// View Engine olarak EJS'yi seçiyoruz
app.set('view engine', 'ejs');
// Layout dosyasını belirtiroyuz.
app.set('layout', 'layouts/main');

// Statik dosyaların (CSS, resimler vb.) yeri
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
// Formdan gelen URL-encoded verileri okuyabilmek için:
app.use(express.urlencoded({ extended: true })); // Front-end'den gelen form submitlerinde input bilgilerini req.body içine atar.
// Eğer JSON verisi alacaksan:
app.use(express.json()); // Front-end'den gelen json isteklerini req.body içine atar.
app.use(cookieParser()); // Bu middleware, tarayıcıdan gelen cookie’leri okuyup req.cookies nesnesine dönüştürür.
app.use(session({
    secret: process.env.SESSION_SECRET, // Oturum verilerini imzalamak için kullanılır
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Canlı ortamda (HTTPS) true olmalıdır
        httpOnly: true, // XSS (Cross-Site Scripting) saldırılarını önler; JavaScript çerezlere erişemez
        maxAge: 1000 * 60 * 60 * 24 // Oturumun açık kalacağı süre (Örn: 1 gün)
    }
}));

// Guest token cookie'sinin süresi bitmiş ise, yenile. 7 günde bir yeniler.
app.use(trySetGuestToken);


// Her sayfadan önce çalışıp oturum açan kullanıcıyı EJS'e aktarır
app.use(async (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded; // EJS için.
    } catch (err) {
        req.user = null;
        res.locals.user = null;
    }
    next();
});

// Header'da gözükmesi adına sepetteki ürün sayısını hesaplar.
app.use(getCartItemCount);

// Sayfaların önbelleğe kaydedilmiş versiyonlarının yüklenmesini engeller, her sayfa gidildiğinde yeniden yüklenir.
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});


// Ana sayfa route'u
app.get('/', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('pages/index', {
        title: 'Ana Sayfa'
    });
});

app.use('/account', requireAuth, accountRoutes)
app.use('/cart', requireAuth, cartRoutes);
app.use('/', productRoutes);
app.use('/', authRoutes);
app.use('/category', categoryRoutes);
app.use('/', requireAuth, shopRoutes);

module.exports = app; // Vercel için import gerekli.

if (require.main === module) { // Localde çalışmak için.
    app.listen(PORT, () => {
        console.log(`Server ${PORT} portunda çalışıyor`);
    });
}
