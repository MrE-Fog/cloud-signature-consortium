var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var passport = require('passport-http');
var mongoose = require('mongoose');
var config = require('config');
var users = require('./models/userModel');

var infoRouter = require('./routes/info');
var authRouter = require('./routes/auth');
var credentialsRouter = require('./routes/credentials');
var signaturesRouter = require('./routes/signatures');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

app.use('/csc/v1/info', infoRouter);
app.use('/csc/v1/auth', authRouter);
app.use('/csc/v1/credentials', credentialsRouter);
app.use('/csc/v1/signatures', signaturesRouter);


mongoose.connect(config.getDBConnectionString()), { useNewUrlParser: true };
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

});

passport.use(new BasicStrategy(
  function (userid, password, done) {
    User.findOne({ username: userid }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    })
  }
));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err.toString() });
});

module.exports = app;
