const { check, validationResult } = require('express-validator');
const Piece = require('../models/piece');
const { DateTime } = require('luxon');
const fs = require('fs');

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

exports.createPiece = (req, res, next) => {
  const { parsedBody } = res.locals;
  let data = {
    title: parsedBody.title,
    authors: [],
    repertoire: parsedBody.repertoire,
    genre: parsedBody.genre ? parsedBody.genre : [],
    comment: parsedBody.comment,
    versions: [],
    date_added: DateTime.now().toLocaleString(),
  };

  parsedBody.authors.forEach((author) => {
    if (author.name && author.surname) {
      data.authors.push(author);
    }
  });
  parsedBody.versions.forEach((version, i) => {
    data.versions.push({});
    data.versions[i].voices = {}
    data.versions[i].files = {}
    data.versions[i].files.pdf = {}
    data.versions[i].files.quantity = {}
    data.versions[i].files.location = {}
    data.versions[i].arr_authors = [];
    if (version.arr_author) {
      version.arr_author.forEach((author) => {
        if (author.name && author.surname) {
          data.versions[i].arr_authors.push(author);
        }
      });
    }
    data.versions[i].voices.gender = version.gender;
      data.versions[i].voices.num_of_voices = version.num_of_voices
        ? version.num_of_voices
        : 0;
      data.versions[i].accompaniment = version.accompaniment
        ? version.accompaniment
        : [];

    if (res.locals.fileIndexes) {
      if (res.locals.fileNames[i]) {
        data.versions[i].files.pdf.url =
          res.locals.fileUrls[i];
        data.versions[i].files.pdf.thumbnail = fs.readFileSync(
          `${process.cwd()}/tmp/${res.locals.fileNames[i]}.jpg`
        );
      }
    }
    data.versions[i].files.quantity = {
      originals: version.originals ? version.originals : 0,
      copies: version.copies ? version.copies : 0,
    };
    data.versions[i].files.location = {
      cabinet: version.cabinet,
      box: version.box,
    };
  });
  console.log('parsedBody: ', parsedBody);
  console.log('data: ', data);
  const piece = new Piece(data);

  piece.save((err) => {
    if (err) {
      return res.send(err);
    }
    res.statusMessage = 'Piece created successfully';
    return res.status(200).json({ msg: 'Piece created successfully' });
  });
};
