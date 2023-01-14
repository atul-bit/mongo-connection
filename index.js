var http = require('http');
var express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
process.env.NODE_ENV = 'production';
var app = express();
app.use(cors());
app.set('port', process.env.PORT);
app.use(express.json());
app.use(helmet());

let server = http.createServer(credentials = {}, app);
app.use('/static', express.static(path.join(__dirname, './uploads')));

app.get('/', (req, resp) => { 
    resp.status(200).send({"key": "Welcome"});
});

app.use('/user', userRoutes);

server.listen(app.get('port'), function() {
    console.log('Server started on ' + app.get('port'));
});