const { v4: uuidv4 } = require('uuid');

const trySetQuestToken = (req, res, next) => {
    // Eğer kullanıcının tarayıcısında guest_token çerezi yoksa oluşturalım
    if (!req.cookies.guest_token && !req.session.user) {
        const guestToken = uuidv4();

        // Çerezi 30 gün boyunca saklanacak şekilde tarayıcıya gönderiyoruz
        res.cookie('guest_token', guestToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 günlük token
            httpOnly: true
        });

        req.guestToken = guestToken;
    } else {
        req.guestToken = req.cookies.guest_token;
    }
    next();
}

module.exports = {
    trySetQuestToken
}