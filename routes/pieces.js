const express = require('express');
const router = express.Router();
const pieceController = require('../controllers/pieceController');

router.get('/', pieceController.pieceList);

module.exports = router;
