const pool = require('../db');
const { addShopInfosIntoUserSession } = require('../utils/sessionUser');
const shopService = require('../services/shopService');

const getBecomeASellerPage = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('pages/become-a-seller', {
        title: 'Satıcı ol',
        layout: false
    });
}

const createSellerAcount = async (req, res) => {
    const { shopName, slug, iban } = req.body;
    // const ibanControlUrl = `https://openiban.com/validate/${iban}?getBIC=true&validateBankCode=true`;
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.json({
            success: false,
            message: "Satıcı hesabı oluşturma başarısız. Session'da kayıtlı userId bulunamadi."
        })
    }
    const createAccQuery = "INSERT into shops (user_id, shop_name, slug, iban, approved) VALUES ($1, $2, $3, $4, true) RETURNING id, shop_name";
    try {
        const createResponse = await pool.query(createAccQuery, [userId, shopName, slug, iban]);
        if (createResponse.rowCount > 0) {
            const shop = createResponse.rows[0];
            addShopInfosIntoUserSession(req, shop.id, shop.shop_name);
            res.json({
                success: true,
                message: "Satıcı hesabı başarıyla oluşturuldu."
            });
        }
    }
    catch (err) {
        console.log("Satıcı hesabı oluşturulurken hata oluştu: ", err.message);
    }
}

const getMyShop = async (req, res) => {
    let shopId;
    if (req.session.user) {
        if (req.session.user.role == "seller") {
            shopId = req.session.user.shopId;
        }
        else {
            return res.status(401).send("Oturumdaki hesapta satıcı rolü bulunamadi.");
        }
    }
    const productDatas = shopService.getShopProductsById(shopId);
    res.render('./pages/my-shop', { title: "Mağazam", products: productDatas });
}
module.exports = {
    getMyShop,
    getBecomeASellerPage,
    createSellerAcount,
}