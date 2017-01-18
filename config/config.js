//Port
const port   = process.env.port || 3000;
const db     = process.env.MONGODB_URI || 'mongodb://localhost/where-am-i';
const secret = process.env.SECRET || 'hiding in plain sight';
//Exports
module.exports = {
  port: port,
  db: db,
  secret: secret
};
