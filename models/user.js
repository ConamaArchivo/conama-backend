const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Escribe una dirección de correo electrónico'],
    validate: [isEmail, 'Escribe una dirección de correo electrónico válida'],
  },
  password: {
    type: String,
    required: [true, 'Escribe una contraseña'],
    minlength: [8, 'La contraseña deben tener 8 caracteres como mínimo'],
  },
  refreshToken: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
