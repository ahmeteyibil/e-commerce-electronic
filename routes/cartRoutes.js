const express = require('express')
const router = express.Router()
const {
    addItemToCart,
    decreaseQuantity,
    increaseQuantity,
    getCartPage,
    removeItem 
} = require('../controllers/cartController');

router.get("/", getCartPage);
router.post('/add', addItemToCart);
router.post('/increase', increaseQuantity);
router.post('/decrease', decreaseQuantity);
router.post('/remove-item', removeItem);


module.exports = router
