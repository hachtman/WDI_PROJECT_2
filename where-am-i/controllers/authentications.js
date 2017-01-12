// @flow

const User   = require('../models/user');
const jwt    = require('jsonwebtoken');
const config = require('../config/config');

function authRegister(req, res) {
  console.log('ping');
  User.create(req.body.user, (err, user) => {
    console.log(err);
    if (err) return res.status(500).json({ message: 'auth register broken' });

    const token = jwt.sign(user._id, config.secret, { expiresIn: 60*60*24 });

    return res.status(201).json({
      message: `Welcome ${user.username}`,
      user,
      token
    });
  });
}

function authLogin(req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    console.log(user, err);
    if (err) return res.status(500).json({ message: 'auth login is broken' });

    const token = jwt.sign(user._id, config.secret, { expiresIn: 60*60*24 });

    return res.status(200).json({
      message: `Welcome back ${user.username}`,
      user,
      token
    });
  });
}

module.exports = {
  authReg: authRegister,
  authLog: authLogin
};
