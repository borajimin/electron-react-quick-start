var express = require('express');
var bodyParser = require('body-parser');
//var routes = require('./routes/index');
var auth = require('./routes/auth');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('../models/models.js');
var User = models.User;
var app = express();


// view engine setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport stuff here
// YOUR CODE HERE
var session = require('express-session');
app.use(session({
  secret: process.env.PASSPORT_SECRET || 'fake secret'
}));

app.use(passport.initialize());
app.use(passport.session());


// Tell Passport how to set req.user
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done);
});

// Tell passport how to read our user models
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  User.findOne({ username: username, password: password }, function (err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.log("passport authentication", err);
      return done(err);
    }

    // if no user present, auth failed
    if (!user) {
      return done(null, false);
    }

    // auth has has succeeded
    return done(null, user);
  });
}));

// Uncomment these out after you have implemented passport in step 1
app.use('/', auth(passport));
//app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

var server = app.listen( 3000, function () {
  console.log('Backend server for Electron App running on port 3000!');
});
require('./webSockets')(server);
