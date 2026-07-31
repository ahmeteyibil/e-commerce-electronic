const express = require('express')
const router = express.Router()
const {addItemToCart} = require('../controllers/cartController')
const {getCartPage} = require("../controllers/cartController")

router.get("/", getCartPage);
router.post('/add', addItemToCart);

module.exports = router
