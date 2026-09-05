const uuidModule = import('uuid');

const trySetQuestToken = async (req, res, next) => {
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
        } else {
            req.guestToken = req.cookies.guest_token;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    trySetQuestToken
}