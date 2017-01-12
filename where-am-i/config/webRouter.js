const express = require('express');
const router  = express.Router();
const statics = require('../controllers/statics');

router.route('/').get(statics.home);

module.exports = router;
