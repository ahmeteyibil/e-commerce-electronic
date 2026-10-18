const pool = require("../db");
const {getCategories} = require("../services/shopService");
const {getAllProducts} = require("../services/productService");
const getHomePage = async (req,res) =>{
    const homeCategories = await getCategories();
    const homeFeatures = [
        {
            title: 'Sade keşif',
            description: 'Aradığın ürüne gereksiz kalabalık olmadan ulaş.',
            icon: 'fa-solid fa-magnifying-glass'
        },
        {
            title: 'Güvenli alışveriş',
            description: 'Hesabın ve sepetin güvenli oturum yönetimiyle korunur.',
            icon: 'fa-solid fa-shield-halved'
        },
        {
            title: 'Bağımsız satıcılar',
            description: 'Farklı satıcıların seçilmiş ürünlerini tek yerde keşfet.',
            icon: 'fa-solid fa-store'
        }
    ];
    const homeProducts = await getAllProducts();
    res.render('pages/home', {
        title: 'Ana Sayfa',
        homeCategories: homeCategories,
        homeFeatures: homeFeatures,
        homeProducts: homeProducts
    });
}

module.exports = {
    getHomePage,

}