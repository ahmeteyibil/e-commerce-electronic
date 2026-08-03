const express = require('express')
const router = express.Router()
const {addItemToCart, decreaseQuantityFromCart, increaseQuantityFromCart, getCartPage} = require('../controllers/cartController')

router.get("/", getCartPage);
router.post('/add', addItemToCart);
router.post('/increase', increaseQuantityFromCart)
router.post('/decrease', decreaseQuantityFromCart)

module.exports = router
