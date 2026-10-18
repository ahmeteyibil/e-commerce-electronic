const { getCategories } = require("../services/shopService");
// Kategorileri çek (header için)
const setCategories = async (req, res, next) => {
    try {
        const categories = await getCategories();
        res.locals.categories = categories || [];
    } catch(err){
        console.log("Kategoriler local'e set edilirken hata oluştu: ", err.message);
        res.locals.categories = [];
    }
    next();
};

module.exports = {
    setCategories
}