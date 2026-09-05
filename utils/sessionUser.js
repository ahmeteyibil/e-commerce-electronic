const addShopInfosIntoUserSession = (req, shopId, shopName) => {
    if (!req.session.user) {
        return;
    }
    req.session.user.role = "seller";
    req.session.user.shopId = shopId;
    req.session.user.shopName = shopName;
};

const saveUserToSession = function (req, userData) {
    req.session.user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        shopId: userData.shopId,
        shopName: userData.shopName
    };
}

module.exports = {
    saveUserToSession,
    addShopInfosIntoUserSession
};
