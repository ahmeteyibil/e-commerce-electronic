const pool = require('../db');

const getCategoryPage = async (req, res) => {
    const slug = req.params.slug;
    const categoryQuery = "SELECT * from categories WHERE slug = $1";
    try {
        const categoryResult = await pool.query(categoryQuery, [slug]);
        if (categoryResult.rows.length === 0) {
            // return kullanmak çok önemlidir, yoksa kod aşağıya doğru çalışmaya devam eder!
            return res.status(404).send("Kategori bulunamadı"); 
        }
        const categoryInfos = categoryResult.rows[0];
        const productQuery = "SELECT * from products WHERE category_id = $1";
        const productResults = await pool.query(productQuery, [categoryInfos.id]);
        const products = productResults.rows;
        res.render('pages/category', {title: `Kategori: ${categoryInfos.name}`, products: products, categoryName: categoryInfos.name});
    } catch (err) {
        console.log("Kategori sayfasi getirilirken hata olustu: ", err.message);
        res.status(500).send("Sunucu hatası meydana geldi.");
    }
}

module.exports = {
    getCategoryPage
}