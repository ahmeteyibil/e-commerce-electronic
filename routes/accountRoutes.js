const express = require("express");
const router = express.Router();
const accountController = require('../controllers/accountController');
const { requireAuth } = require("../middlewares/authMiddlewares");

router.get("/my-account", requireAuth, accountController.getMyProfile);

module.exports = router;