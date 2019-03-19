var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//////////// solve CORS and ACAO for frontend /////////////
var cors = require('cors');
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
///////////////////////////////////////////////////////////

//////////// init socket and assign to global /////////////
var io = require('socket.io')();
// use for first connection to resolve client ip
io.on('connection', function (client) {
  console.log('user connected ok.');
});
io.listen(3001);
global.io = io;
///////////////////////////////////////////////////////////

//load index
var index = require('./index');
app.use('/', index);

// create log
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware catch error
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handle
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
