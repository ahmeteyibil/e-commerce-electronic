const pool = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcrypt'); // Şifre doğrulama için
 
const getLoginPage = (req,res) => {
    res.render("pages/login", {title: "Giriş Yap", layout: false})
}
const postLoginPage = async (req,res) => {
    var { email, password } = req.body; // unpacking
    email = email.trim()
    password = password.trim()
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // Kullanıcı veritabanında bulunamadıysa
        if (result.rows.length === 0) {
            return res.status(400).send('E-posta veya şifre hatalı.');
        }

        const user = result.rows[0]; // Bulunan kullanıcı kaydı

        // 3. Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştırıyoruz
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).send('E-posta veya şifre hatalı.');
        }

        // 4. Giriş Başarılı: Kullanıcı oturumunu (session) başlatıyoruz
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        // Başarılı giriş sonrası ana sayfaya yönlendiriyoruz
        res.redirect('/');

    } catch (err) {
        console.error('Giriş hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
}
module.exports = {
    getLoginPage,
    postLoginPage
}