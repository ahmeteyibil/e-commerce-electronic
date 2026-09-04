const express = require('express')
const router = express.Router();
const { getMyShop } = require('../controllers/shopController');
const { getBecomeASellerPage, createSellerAcount } = require('../controllers/shopController');

router.get("/my-shop", getMyShop);

router.get('/become-a-seller', getBecomeASellerPage);
router.post('/become-a-seller', createSellerAcount);


module.exports = router;