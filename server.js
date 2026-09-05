require('dotenv').config();

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
const categoryRoutes = require('./routes/categoryRoutes')
const shopRoutes = require('./routes/shopRoutes');
const app = express();

const PORT = process.env.PORT; 


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
app.get('/profile', (req, res) => {
    // views/index.ejs dosyasını render eder ve veri gönderir
    res.render('pages/profile', {
        title: 'Profilim'
    });
});
app.use('/cart', cartRoutes)
app.use('/', productRoutes); 
app.use('/', authRoutes); 
app.use('/category', categoryRoutes);
app.use('/', shopRoutes);

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
  });
}
