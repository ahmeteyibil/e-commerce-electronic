const express = require('express')
const router = express.Router();
const { getMyShop } = require('../controllers/shopController');
const { getBecomeASellerPage, createSellerAcount, addItemToShop, getMyProducts } = require('../controllers/shopController');

router.get("/my-shop", getMyShop);
router.post("/add-item-to-shop", addItemToShop);
router.get('/become-a-seller', getBecomeASellerPage);
router.post('/become-a-seller', createSellerAcount);
router.get("/get-my-products", getMyProducts);

module.exports = router;