const addShopInfosIntoUserSession = (req, shopId, shopName) => {
    if (!req.session.user) {
        return;
    }
    req.session.user.role = "seller";
    req.session.user.shopId = shopId;
    req.session.user.shopName = shopName;
};

const saveUserToSession = function (req, user) {
    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
    };
}

module.exports = {
    saveUserToSession,
    addShopInfosIntoUserSession
};
