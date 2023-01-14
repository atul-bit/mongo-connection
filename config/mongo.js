const Mongo = require('../common/mongo');
require('dotenv').config();

module.exports = new Mongo(`${process.env.mongoUrl}`, `${process.env.mongoDBName}`);
