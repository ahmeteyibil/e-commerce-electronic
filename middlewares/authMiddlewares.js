require('dotenv').config();

const uuidModule = import('uuid');
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Token'ın sahte olup olmadığını ve süresini kontrol ediyoruz
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Controller ve API mantığı için
        next();
    } catch (err) {
        // Token süresi geçmiş veya oynanmış
        res.clearCookie('authToken');
        return res.redirect('/login');
    }
};

const trySetGuestToken = async (req, res, next) => {
    try {
        const { v4: uuidv4 } = await uuidModule;

        // Eğer kullanıcının tarayıcısında guest_token çerezi yoksa oluşturalım
        if (!req.cookies.guest_token && !req.session.user) {
            const guestToken = uuidv4();

            // Çerezi 30 gün boyunca saklanacak şekilde tarayıcıya gönderiyoruz
            res.cookie('guest_token', guestToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 günlük token
                httpOnly: true
            });
            console.log("Yeni guestToken ataması: ", guestToken);
            req.guestToken = guestToken;
        } else if(req.session.user){
            res.clearCookie("guest_token");
        } else {
            req.guestToken = req.cookies.guest_token;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    trySetGuestToken,
    requireAuth
}