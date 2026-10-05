const express = require('express')
const router = express.Router()
const {
    addItemToCart,
    decreaseQuantity,
    increaseQuantity,
    getCartPage,
    removeItem,
    getMakePaymentPage,
    makePayment
} = require('../controllers/cartController');
const { cartItemUpdateAuthorize } = require('../middlewares/cartMiddlewares');

router.get("/", getCartPage);
router.get("/make-payment", getMakePaymentPage);
router.post('/add', addItemToCart);
router.post('/increase', increaseQuantity);
router.post('/decrease', decreaseQuantity);
router.delete('/remove-item', cartItemUpdateAuthorize, removeItem);
router.post('/pay', makePayment);


module.exports = router
