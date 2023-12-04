import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// var MongoDBStore = require('connect-mongodb-session')(session);
import logger from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import postRouter from './routes/posts';
import messagesRouter from './routes/messages';

dotenv.config();
const app = express();
// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
//   collection: 'mySessions',
// });
const dbUrl: string =
  process.env.NODE_ENV === 'test'
    ? (process.env.TEST_DATABASE_URL as string)
    : (process.env.DATABASE_URL as string);
mongoose.connect(dbUrl);

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

app.use('/auth', authRouter);
app.use(function checkSignIn(req, res, next) {
  const user = (req.session as any).user;
  if (user) {
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
} as express.ErrorRequestHandler);

export default app;
