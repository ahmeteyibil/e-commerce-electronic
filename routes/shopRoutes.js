const express = require('express')
const router = express.Router();
const { getMyShop } = require('../controllers/shopController');
const { getBecomeASellerPage, createSellerAcount, addItemToShop } = require('../controllers/shopController');

router.get("/my-shop", getMyShop);
router.post("/add-item-to-shop", addItemToShop);
router.get('/become-a-seller', getBecomeASellerPage);
router.post('/become-a-seller', createSellerAcount);


module.exports = router;