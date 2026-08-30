const express = require('express');
const router = express.Router();
const {getBecomeASellerPage} = require('../controllers/sellerController');

router.get('become-a-seller', getBecomeASellerPage);
router.post('become-a-seller', createSellerAcount);


module.exports = router;