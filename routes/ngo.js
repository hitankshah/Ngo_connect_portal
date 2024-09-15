const express = require('express');
const { listNGOs } = require('../controllers/ngoController');
const router = express.Router();

router.get('/list', listNGOs);

module.exports = router;
