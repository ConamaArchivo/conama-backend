const { check, validationResult } = require('express-validator');
const { DateTime } = require('luxon');
const Piece = require('../models/piece');

exports.pieceList = (req, res, next) => {
  Piece.find({})
    .sort({ title: 1 })
    .exec((error, list) => {
      if (error) {
        return next(error);
      }
      res.json(list);
});
};

exports.pieceCreate = (req, res, next) => {
  if (!Array.isArray(req.body.genre)) {
    if (typeof req.body.genre === 'undefined') req.body.genre = [];
    else req.body.genre = [req.body.genre];
  }
  if (!Array.isArray(req.body.accompaniment)) {
    if (typeof req.body.accompaniment === 'undefined') {
      req.body.accompaniment = [];
    } else req.body.accompaniment = [req.body.accompaniment];
  }

  const piece = new Piece({
    title: req.body.title,
    author: [
      {
        name: req.body['author-name1'],
        surname: req.body['author-surname1'],
        country: req.body['author-country1'],
        role: req.body['author-role1'],
      },
    ],
    genre: req.body.genre,
    repertoire: req.body.repertoire,
    comment: req.body.comment,
    versions: [
      {
        arrangement_author: [
          {
            name: req.body['arr-author-name1'],
            surname: req.body['arr-author-surname1'],
            country: req.body['arr-author-country1'],
            role: req.body['arr-author-role1'],
          },
        ],
        voices: {
          gender: req.body.gender,
          num_of_voices: req.body['num-voices'],
        },
        accompaniment: req.body.accompaniment,
        files: {
          pdf: {
            url: res.locals.pdfUrl,
            thumbnail: res.locals.pdfThumbnail,
          },
          quantity: {
            originals: req.body.originals,
            copies: req.body.copies,
          },
          location: {
            cabinet: req.body.cabinet,
            box: req.body.box,
          },
        },
      },
    ],
    date_added: DateTime.now().toLocaleString(),
  });

  piece.save((error) => {
    if (error) {
      return next(error);
    }
    res.redirect('/obras');
  });
};
