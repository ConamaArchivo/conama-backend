const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const pieceController = require('../controllers/pieceController');

router.get('/', (req, res, next) => {
  res.json("pieceList");
});

router.post(
  '/',
  driveController.upload.single('pdf'),
  driveController.createThumbnail,
  driveController.uploadPDF,
  driveController.getPublicUrl,
  pieceController.pieceCreate
);

module.exports = router;
