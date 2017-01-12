// @flow
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  imagesrc: { type: String, trim: true },
  hometown: { type: String },
  passwordHash: { type: String, required: true }
});

userSchema.virtual('password').set(setPassword);

//The set password function takes the password argument and stores it in the temporary variable value. The new variable password hash is the encrypted password
function setPassword(value) {
  this._password = value;
  this.passwordHash = bcrypt.hashSync(value, bcrypt.genSaltSync(10));
}

//Listens for the field password confirmation then runs the function.
userSchema.virtual('password2').set(setPassword2);

//The set password confirmation assigns the password confirmation to the object.
function setPassword2(password2) {
  this._password2 = password2;
}

//Looks for the passwordHash and runs the validatehash function
userSchema.path('passwordHash').validate(validateHash);

//Tests to see if given password is valid.
function validateHash() {
  //Checks to see if password is new.
  if (this.isNew) {
    //Checks to see if a password has been given at all.
    if (!this._password) {
      return this.invalidate('password', 'A password is required.');
    }
    //checks length
    if (this._password.length < 6) {
      this.invalidate('password', 'must be at least 6 characters.');
    }
    //tests to see if it matches the confirmation.
    if (this._password !== this._password2) {
      return this.invalidate('password2', 'Passwords do not match.');
    }
  }
}

//This looks for the passwordHash path in the schema and runs the validate email function.
userSchema.path('email').validate(validateEmail);

//Uses the isEmail method build into validator to test if the email is valid.
function validateEmail(email) {
  if (!validator.isEmail(email)) {
    return this.invalidate('email', 'must be a valid email address');
  }
}

userSchema.methods.validatePassword = validatePassword;

function validatePassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

//Exports the Schema.
module.exports = mongoose.model('User', userSchema);
