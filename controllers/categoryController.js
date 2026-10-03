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
        const productQuery = `SELECT p.*, pi.image_url AS primary_image_url FROM products p LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true WHERE p.category_id = $1 ORDER BY p.id ASC`;
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