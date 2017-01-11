// @flow
const express = require('express');

const app = express();

const config = require('./config/config');

app.listen(config.port, () => {
  console.log(`express is alive and running on port: ${config.port}`);
});
