const express = require('express');
const router = express.Router();
const verifyAuth = require('../middleware/verifyAuth');
const {
  getDownloadUrl,
  getViewUrl,
} = require('../controllers/driveController');

router.get('/:id/:version/view', verifyAuth, getViewUrl);
router.get('/:id/:version/download', verifyAuth, getDownloadUrl);

module.exports = router;
