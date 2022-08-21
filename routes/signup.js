const express = require('express');
const router = express.Router();
const { handleSignup } = require('../controllers/signupController');

router.post('/', handleSignup);

module.exports = router;
