// @flow
//Seeds file.

//require mongoose
const mongoose = require('mongoose');

const config = require('./config/config');

//connect to the database
mongoose.connect(config.db);

//require the model
const User = require('../models/user');

//Drop database
User.collection.drop();
