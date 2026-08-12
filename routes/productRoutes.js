const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Anasayfa isteği geldiğinde controller'daki fonksiyonu çalıştır
router.get('/products', productController.getProductsPage);
router.get('/product/:id', productController.getProductPage);


module.exports = router;