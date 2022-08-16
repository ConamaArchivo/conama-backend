const express = require('express');
const router = express.Router();
const { pieceList } = require('../controllers/pieceController');

router.get('/', pieceList);

module.exports = router;
