const accountService = require('../services/accountService')

const getMyProfile = async (req, res) => {
    const userId = req.user ? req.user.id : null;
    if(!userId){
        return res.redirect("/login");
    }
    const userData = await accountService.getAllUserInfosById(userId);
    res.render('pages/my-profile', {title: "Profilim", userData: userData});
}

module.exports = {
    getMyProfile
}