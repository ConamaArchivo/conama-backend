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

exports.autoCompleteData = (req, res, next) => {
  Piece.find({
    // versions: { $elemMatch: { accompaniment: { $exists: true, $ne: [] } } },
  })
    .select({ versions: 1, genre: 1, authors: 1, _id: 0 })
    .exec((error, data) => {
      if (error) {
        return next(error);
      }
      let arr_names = [];
      let arr_surnames = [];
      let accompaniments = [];
      data.forEach((element1) => {
        element1.versions.forEach((element2) => {
          element2.accompaniment.forEach((element3) => {
            accompaniments.push(element3);
          });

          element2.arr_authors.forEach((element3) => {
            arr_names.push(element3.name);
            arr_surnames.push(element3.surname);
          });
        });
      });

      let genres = [];
      data.forEach((element1) => {
        element1.genre.forEach((element2) => {
          genres.push(element2);
        });
      });

      let names = [];
      let surnames = [];
      data.forEach((element1) => {
        element1.authors.forEach((element2) => {
          names.push(element2.name);
          surnames.push(element2.surname);
        });
      });

      res.json({
        names: [...new Set(names)].sort(),
        surnames: [...new Set(surnames)].sort(),
        arr_names: [...new Set(arr_names)].sort(),
        arr_surnames: [...new Set(arr_surnames)].sort(),
        genres: [...new Set(genres)].sort(),
        accompaniments: [...new Set(accompaniments)].sort(),
      });
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
    data.versions[i].voices = {};
    data.versions[i].files = {};
    data.versions[i].files.pdf = {};
    data.versions[i].files.quantity = {};
    data.versions[i].files.location = {};
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
        data.versions[i].files.pdf.url = res.locals.fileUrls[i];
        // data.versions[i].files.pdf.thumbnail = fs.readFileSync(
        //   `${process.cwd()}/tmp/${res.locals.fileNames[i]}.jpg`
        // );
        data.versions[i].files.pdf.thumbnail = fs.readFileSync(
          `${process.cwd()}/tmp/thumbnail.jpg`
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
  const piece = new Piece(data);

  piece.save((err) => {
    if (err) {
      return res.send(err);
    }
    res.statusMessage = 'Piece created successfully';
    return res.status(200).json({ msg: 'Piece created successfully' });
  });
};
