const express = require('express')
const router = express.Router()
const {
    addItemToCart,
    decreaseQuantity,
    increaseQuantity,
    getCartPage,
    removeItem
} = require('../controllers/cartController');
const { cartItemUpdateAuthorize } = require('../middlewares/cartMiddlewares');

router.get("/", getCartPage);
router.post('/add', addItemToCart);
router.post('/increase', increaseQuantity);
router.post('/decrease', decreaseQuantity);
router.post('/remove-item', cartItemUpdateAuthorize, removeItem);


module.exports = router
