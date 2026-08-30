const pool = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcrypt'); // Şifre doğrulama için
const { options } = require('../routes/productRoutes');

const getLoginPage = (req, res) => {
    res.render("pages/login", { title: "Giriş Yap", layout: false })
}
const postLoginPage = async (req, res) => {
    var { email, password } = req.body; // unpacking
    email = email.trim();
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
            
            return res.status(400).json({
                success: false,
                message: "E-posta veya şifre hatalı."
            });;
        }



        // 4. Giriş Başarılı: Kullanıcı oturumunu (session) başlatıyoruz
        req.session.regenerate(function (err) {
            if (err) return next(err);

            // Eski SID yok edildi, yepyeni bir SID üretildi. 
            // Artık güvenle kullanıcı bilgilerini oturuma yazabiliriz.
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.created_at
            };
            // Başarılı giriş sonrası ana sayfaya yönlendiriyoruz
            req.session.save(() => {
                res.json({
                    success: true,
                    message: "Kullanıcı girişi başarılı."
                });
            });
        });



    } catch (err) {
        console.error('Giriş hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
}

const getRegisterPage = (req, res) => {
    res.render("pages/register", { title: "Kayıt Ol", layout: false })
}
const postRegisterPage = async (req, res) => {
    var { name, email, password, password_again } = req.body; // unpacking
    name = name.trim();
    email = email.trim();
    password = password.trim();
    password_again = password_again.trim();
    if (password != password_again) {
        res.send("şifreler eşleşmiyor.")
        return;
    }
    // Bu email'e kayıtlı bir hesap var mı? 
    const emailExistQuery = "SELECT * FROM users WHERE email = $1"
    const emailResult = await pool.query(emailExistQuery, [email]);
    if (emailResult != undefined && emailResult.rowCount > 0) {
        res.send("Bu email ile bir kayıtlı hesap zaten var.")
        return;
    }
    const dateOfNow = new Date();
    try {
        const password_h = await bcrypt.hash(password, 10);
        let registerQueryStr = "INSERT into users (name, email, password_hash, created_at) VALUES ($1,$2,$3,$4)";
        const result = await pool.query(registerQueryStr, [name, email, password_h, dateOfNow]);
        if (result.rowCount > 0) {
            setTimeout(() => {
                res.redirect('/');
            }, 3000);
        }
    }
    catch (err) {
        console.error('Kayıt hatası:', err.message);
        res.status(500).send('Sunucu Hatası');
    }
}
const getLogout = async (req, res) => {
    if (res.locals.user) {
        logOutUser(req, res);
    }
    else {
        res.redirect('/');
    }
}
const logOutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Çıkış yaparken hata oluştu:", err);
            return res.status(500).send("Sunucu Hatası");
        }

        // Tarayıcıdaki oturum çerezini (cookie) temizliyoruz 
        // (express-session varsayılan olarak çerez adını 'connect.sid' yapar)
        res.clearCookie('connect.sid');

        // Kullanıcıyı ana sayfaya veya giriş sayfasına yönlendiriyoruz
        res.redirect('/');
    });
}
module.exports = {
    getLoginPage,
    postLoginPage,
    getRegisterPage,
    postRegisterPage,
    getLogout
}