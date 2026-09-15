const pool = require('../db');
const { addShopInfosIntoUserSession } = require('../utils/sessionUser');
const shopService = require('../services/shopService');

const getBecomeASellerPage = (req, res) => {
    res.render('pages/become-a-seller', {
        title: 'Satıcı ol',
        layout: false
    });
}

const createSellerAcount = async (req, res) => {
    const { shopName, slug, iban } = req.body;
    // const ibanControlUrl = `https://openiban.com/validate/${iban}?getBIC=true&validateBankCode=true`;
    const userId = req.user ? req.user.id : null;
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
    if (req.user) {
        if (req.user.role == "seller") {
            shopId = shopService.getShopByUserId(req.user.id).shopId;
        }
        else {
            return res.status(401).send("Oturumdaki hesapta satıcı rolü bulunamadi.");
        }
    }
    const categories = await shopService.getCategories();
    const productDatas = await shopService.getShopProductsById(shopId);

    console.log("categories:", categories);
    console.log("productDatas:", productDatas);
    res.render('./pages/my-shop', { title: "Mağazam", products: productDatas, categories: categories });
}
const addItemToShop = async (req, res) => {
    let { name, price, categoryId, description, imgUrl } = req.body;
    try {
        // Burada tarayıcıdaki jwt cookie'si ile hızlı bir sorgu yapılıp kullanıcının shopID'si çekilebilir.
        const user = req.user || null;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Ürün ekleme sırasında sunucu tarafında hata: Kullanıcı bulunamadı."
            });
        }
        const shopDatas = await shopService.getShopByUserId(user.id);
        if (!shopDatas) {
            return res.status(404).json({
                success: false,
                message: "İşlem yapılacak yetkili mağaza bulunamadı."
            });
        }
        const shopId = shopDatas.shopId;

        name = name?.trim();
        description = description?.trim();
        imgUrl = imgUrl?.trim();
        
        const query = `INSERT INTO products (name,description,price,image_url,category_id,shop_id)
        VALUES ($1,$2,$3,$4,$5,$6) 
        RETURNING *`;

        const parameters = [name, description, price, imgUrl, categoryId, shopId];

        const response = await pool.query(query, parameters);
        if (response.rowCount > 0){
            const product = response.rows[0];
            return res.status(201).json({
                success: true,
                message: "Ürün başarıyla eklendi.",
                product: product
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: "Ürün ekleme başarısız.",
                product: null
            })
        }
    } catch (err) {
        console.log("Ürün ekleme işlemi sırasında hata: ", err.message);
        return res.status(500).json({
            success: false,
            message: "Ürün ekleme sırasında sunucu hatası oluştu."
        });
    }
};

module.exports = {
    getMyShop,
    getBecomeASellerPage,
    createSellerAcount,
    addItemToShop,
}