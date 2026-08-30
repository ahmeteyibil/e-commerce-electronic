const pool = require('../db');

const getBecomeASellerPage = (req,res) =>{
    if(!req.locals.user){
        res.redirect('/login');
    }
    res.render('/pages/become-a-seller', {
        title: 'Satıcı ol'
    });
}

module.exports = {
    getBecomeASellerPage
}