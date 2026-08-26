const express = require('express');
const router = express.Router();
const {getCategoryPage} = require('../controllers/categoryController');


router.get('/:slug', getCategoryPage);


module.exports = router;