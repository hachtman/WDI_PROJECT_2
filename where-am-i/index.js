// @flow
//Require node modules.
const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const mongoose   = require('mongoose');
const jwt        = require('express-jwt');
const cors       = require('cors');

//Invoke an instance of express
const app = express();

//Require external files.
const config    = require('./config/config');
const apiRoutes = require('./config/apiRoutes');
const webRoutes = require('./config/webRouter');

//Middleware
app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/bower_components`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());


//jwt
app.use('/api', jwt({ secret: config.secret }).unless({
  path: [
    { url: '/api/register', methods: ['POST'] },
    { url: '/api/login', methods: ['POST'] }
  ]
}));

app.use(function jwtErrorHandler(err, req, res, next) {
  if (err.name !== 'UnauthorizedError') return next();
  return res.status(401).json({ message: 'Unauthorized Request (jwtErrorHandler)' });
});

//Routers
app.use('/api', apiRoutes);
app.use('/', webRoutes);


//Connect mongoose to the mongodb url.
mongoose.connect(config.db);

//Tell express to listen on localhost:3000.
app.listen(config.port, () => {
  console.log(`express is alive and running on port: ${config.port}`);
});
