const path = require('path');

const express = require('express');

const visitorController = require('../controllers/visitorController');

const router = express.Router();

router.post('/account/create', visitorController.createAccount)



module.exports = router