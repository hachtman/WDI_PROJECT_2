// @flow
const User = require('../models/user');

function usersIndex(req, res) {
  User.find((err, users) => {
    if (err) return res.status(500).json({ message: 'usersIndex is broken '});
    return res.status(200).json({ users });
  });
}

function userShow(req, res) {
  User.findOne((err, user) => {
    if (err) return res.status(500).json({ message: 'userShow is broken' });
    return res.status(200).json( { user });
  });
}

module.exports = {
  index: usersIndex,
  show: userShow
};
