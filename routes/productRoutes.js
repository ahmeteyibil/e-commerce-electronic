const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Anasayfa isteği geldiğinde controller'daki fonksiyonu çalıştır
router.get('/product-trends', productController.getTrendsPage);
router.get('/product/:id', productController.getProductPage);


module.exports = router;