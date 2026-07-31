var express = require('express')
const router = express.Router()
const authController = require("../controllers/authController")

router.get("/login", authController.getLoginPage);
router.post("/login", authController.postLoginPage);

router.get("/register", authController.getRegisterPage);
router.post("/register", authController.postRegisterPage);

router.get("/logout", authController.getLogout)
module.exports = router;