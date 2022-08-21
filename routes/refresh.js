const express = require('express');
const router = express.Router();
const { handleRefresh } = require('../controllers/refreshTokenController');

router.get('/', handleRefresh);

module.exports = router;
