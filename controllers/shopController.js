const pool = require('../db');
const { addShopInfosIntoUserSession } = require('../utils/sessionUser');
const shopService = require('../services/shopService');

const getBecomeASellerPage = (req, res) => {
    res.render('pages/become-a-seller', {
        title: 'Satıcı ol',
        layout: false
    });
}

async function getMyProducts(req, res) {
    try {
        const { shopId } = req.body;
        const userId = req.user.id;
        const userShopId = await shopService.getShopByUserId(userId);
        if (shopId != userShopId) {
            return res.status(401).json({
                success: false,
                message: "Yetkisiz erişim"
            });
        }
        const products = await shopService.getShopProductsById(shopId);
        if (!products) {
            return res.status(500).json({
                success: false,
                message: "Ürünler null çekildi"
            });
        }
        return res.status(200).json({
            success: true,
            products: products,
            message: "Ürünler başarıyla getirildi"
        });
    } catch (err) {
        console.log("Ürünler getirilirken bir hata oluştu: ", err.message);
        return res.status(500).json({
            success: false,
            message: "Ürünler çekilemedi"
        });
    }
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
            const shop = await shopService.getShopByUserId(req.user.id);
            shopId = shop?.shopId;
        }
        else {
            return res.status(401).send("Oturumdaki hesapta satıcı rolü bulunamadi.");
        }
    }
    const categories = await shopService.getCategories();
    const productDatas = await shopService.getShopProductsById(shopId);

    console.log("categories:", categories);
    console.log("productDatas:", productDatas);
    res.render('./pages/my-shop', { title: "Mağazam", pageStyles: ['/css/my-shop.css'], products: productDatas, categories: categories });
}
const addItemToShop = async (req, res) => {
    let { productName, price, categoryId, description, imgUrl, additionalImgUrls} = req.body;
    try {
        // User var mı kontrolü
        const user = req.user || null;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Ürün ekleme sırasında sunucu tarafında hata: Kullanıcı bulunamadı."
            });
        }
        // Ekstra image sınırı aşılmış mı?
        if(additionalImgUrls.length > 5){
            return res.status(401).json({
                success: false,
                message: "Ekstra resim sınırı aşıldı."
            });
        }

        // Mağaza bilgileri çekiliyor.
        const shopDatas = await shopService.getShopByUserId(user.id);
        if (!shopDatas) {
            return res.status(404).json({
                success: false,
                message: "İşlem yapılacak yetkili mağaza bulunamadı."
            });
        }
        const shopId = shopDatas.shopId;

        productName = productName?.trim();
        description = description?.trim();
        imgUrl = imgUrl?.trim();

        const itemAddQuery = `INSERT INTO products (name,description,price,category_id,shop_id)
        VALUES ($1,$2,$3,$4,$5) 
        RETURNING *`;

        const itemAddParams = [productName, description, price, categoryId, shopId];

        const itemAddResponse = await pool.query(itemAddQuery, itemAddParams);

        const productId = itemAddResponse.rows[0].id;

        const imgAddQuery = `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
        VALUES ($1,$2,$3,$4)`;

        await pool.query(imgAddQuery, [productId, imgUrl, 1, true]);

        for (let i = 0; i < additionalImgUrls.length; i++) {
            await pool.query(imgAddQuery, [productId, additionalImgUrls[i], i+2, false]);
        }
        
        if (itemAddResponse.rowCount > 0) {
            const product = itemAddResponse.rows[0];
            return res.status(201).json({
                success: true,
                message: "Ürün başarıyla eklendi.",
                product: product
            })
        }
        else {
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
    getMyProducts
}