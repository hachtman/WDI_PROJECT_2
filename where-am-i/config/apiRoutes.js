// @ flow
//This file handles all the routing for the api.
const express = require('express');
//This variable represents a new instance of express' router.
const router  = express.Router();
//This requires the user controller functions.
const users    = require('../controllers/users');
const auth     = require('../controllers/authentications');

//Will run the user index function when a get http request is made to  '/users'
router.route('/users').get(users.index);
//Will run the user show function when a get http request is made to '/users:id'
router.route('/users/:id').get(users.show);

router.route('/register').post(auth.authReg);

router.route('/login').post(auth.authLog);



//exports the router
module.exports = router;
