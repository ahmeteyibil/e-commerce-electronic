const homeController = require('../controllers/homeController');
const express = require("express");
const router = express.Router();

router.get("/", homeController.getHomePage);
router.get("/home", (req,res)=>{
    res.redirect("/");
});

module.exports = router;