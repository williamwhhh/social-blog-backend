var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var MongoDBStore = require('connect-mongodb-session')(session);
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var postRouter = require('./routes/posts');
var messagesRouter = require('./routes/messages');

var app = express();
// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
//   collection: 'mySessions',
// });
app.use(cors({ credentials: true, origin: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'hello',
    cookie: { secure: false },
    // store: store,
    resave: false,
    saveUninitialized: true,
  })
);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use(function checkSignIn(req, res, next) {
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error('user session expired');
    console.log(err.message);
    next(err); //Error, trying to access unauthorized page!
  }
});
app.use('/users', usersRouter);
app.use('/posts', postRouter);
app.use('/messages', messagesRouter);

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
  // res.render('error');
  res.json({ message: err.message });
});

module.exports = app;
