"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
// var MongoDBStore = require('connect-mongodb-session')(session);
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const messages_1 = __importDefault(require("./routes/messages"));
const app = (0, express_1.default)();
// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
//   collection: 'mySessions',
// });
app.use((0, cors_1.default)({ credentials: true, origin: true }));
// view engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    secret: 'hello',
    cookie: { secure: false },
    // store: store,
    resave: false,
    saveUninitialized: true,
}));
app.use('/auth', auth_1.default);
app.use(function checkSignIn(req, res, next) {
    const user = req.session.user;
    if (user) {
        next(); //If session exists, proceed to page
    }
    else {
        var err = new Error('user session expired');
        console.log(err.message);
        next(err); //Error, trying to access unauthorized page!
    }
});
app.use('/users', users_1.default);
app.use('/posts', posts_1.default);
app.use('/messages', messages_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
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
exports.default = app;
