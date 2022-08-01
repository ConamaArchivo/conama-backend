const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PieceSchema = new Schema({
  title: { type: String, required: true, maxLength: 150 },
  author: [
    {
      name: { type: String, maxLength: 100 },
      surname: { type: String, maxLength: 100 },
      country: { type: String },
      role: { type: String, maxLength: 100 },
      _id: false,
    },
  ],
  genre: [{ type: String, maxLength: 100 }],
  repertoire: { type: String },
  comment: { type: String, maxLength: 300 },
  versions: [
    {
      arrangement_author: [
        {
          name: { type: String, maxLength: 100 },
          surname: { type: String, maxLength: 100 },
          country: { type: String },
          role: { type: String, maxLength: 100 },
          _id: false,
        },
      ],
      voices: {
        gender: {
          type: String,
        },
        num_of_voices: { type: Number },
      },
      accompaniment: [{ type: String, maxLength: 300 }],
      files: {
        pdf: {
          url: { type: Object },
          thumbnail: { type: Buffer },
        },
        quantity: {
          originals: { type: Number },
          copies: { type: Number },
        },
        location: {
          cabinet: { type: String, maxLength: 50 },
          box: { type: String, maxLength: 50 },
        },
      },
      _id: false,
    },
  ],
  date_added: { type: Date },
});

PieceSchema.virtual('url').get(function () {
  return '/' + this._id;
});

module.exports = mongoose.model('Piece', PieceSchema);
