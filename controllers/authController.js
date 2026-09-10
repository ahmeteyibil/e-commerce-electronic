require('dotenv').config();

const pool = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcrypt'); // Şifre doğrulama için
const jwt = require('jsonwebtoken');
const { getShopByUserId } = require('../services/shopService');
const { addShopInfosIntoUserSession, saveUserToSession } = require('../utils/sessionUser');

const getLoginPage = (req, res) => {
    res.render("pages/login", { title: "Giriş Yap", layout: false })
}
const login = async (req, res) => {
    var { email, password } = req.body; // unpacking
    email = email.trim();
    password = password.trim()
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        // Kullanıcı veritabanında bulunamadıysa
        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Bu e-posta ile bir hesap kayıtlı değil."
            });
        }

        const user = result.rows[0]; // Bulunan kullanıcı kaydı

        // 3. Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştırıyoruz
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "E-posta veya şifre hatalı."
            });
        }

        const payload = {
            id: user.id,
            role: user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie('authToken', token, {
            httpOnly: true, // XSS saldırılarını korur.
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
        });

        res.json({
            success: true,
            message: "Kullanıcı girişi başarılı. Ana sayfaya yönlendiriliyorsunuz."
        });
    } catch (err) {
        console.error('Giriş hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
}



const getRegisterPage = (req, res) => {
    res.render("pages/register", { title: "Kayıt Ol", layout: false })
}
const register = async (req, res) => {
    var { name, email, password, password_again } = req.body; // unpacking
    name = name.trim();
    email = email.trim();
    password = password.trim();
    password_again = password_again.trim();
    if (password != password_again) {
        return res.json({
            success: false,
            message: "Şifreler eşleşmiyor."
        });
    }
    // Bu email'e kayıtlı bir hesap var mı? 
    const emailExistQuery = "SELECT * FROM users WHERE email = $1"
    const emailResult = await pool.query(emailExistQuery, [email]);
    if (emailResult != undefined && emailResult.rowCount > 0) {
        return res.json({
            success: false,
            message: "Bu email ile bir kayıtlı hesap zaten var."
        });
    }
    const dateOfNow = new Date();
    try {
        const password_h = await bcrypt.hash(password, 10);
        let registerQueryStr = "INSERT into users (name, email, password_hash, created_at) VALUES ($1,$2,$3,$4)";
        const result = await pool.query(registerQueryStr, [name, email, password_h, dateOfNow]);
        if (result.rowCount > 0) {
            return res.json({
                success: true,
                message: "Hesap başarıyla oluşturuldu."
            });
        }
    }
    catch (err) {
        console.error('Kayıt hatası:', err.message);
        res.status(500).json({
            success: false,
            message: 'Sunucu Hatası'
        });
    }
}
const getLogout = async (req, res) => {
    if (req.cookies.authToken) {
        logout(req,res);
    }
    else {
        res.status(403).json({
            success: false,
            message: "Kullanici girişi olmadığı için kullanıcı çıkışı yapılamadı."
        });
    }
}
const logout = (req,res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.clearCookie('authToken');
        res.redirect('/');
    });

}
module.exports = {
    getLoginPage,
    postLoginPage: login,
    getRegisterPage,
    postRegisterPage: register,
    getLogout,
}