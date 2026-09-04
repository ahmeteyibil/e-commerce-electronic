const pool = require('../db');

const getBecomeASellerPage = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('pages/become-a-seller', {
        title: 'Satıcı ol',
        layout: false
    });
}

const getSellerInfosByUser = function (userId){
    
}

const createSellerAcount = (req, res) => {
    const {sellerAccName} = req.body;
}
module.exports = {
    getBecomeASellerPage,
    createSellerAcount,
    getSellerInfosByUser
}