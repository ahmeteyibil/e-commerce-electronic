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

const getShopIDByUser = async function (userId){
    const q = "SELECT * from shops WHERE user_id = $1";
    const response = await pool.query(q, [userId]);
    if(response.rowCount > 0){
        const shopId = response.rows[0].id;
        const shopName = response.rows[0].shop_name;
        return {
            shopId,
            shopName
        }
    }
    else{
        return null;
    }
}

const createSellerAcount = (req, res) => {
    const {shopName, slug, iban} = req.body;
    const ibanControlUrl = `https://openiban.com/validate/${iban}?getBIC=true&validateBankCode=true`;
    const createAccQuery = "INSERT into shops (user_id, shop_name, slug, iban)"
}
const getMyShop = async (req,res) => {

}
module.exports = {
    getMyShop,
    getBecomeASellerPage,
    createSellerAcount,
    getShopIDByUser
}