const createError = require('http-errors');
const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const session = require('express-session');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const config = require('./config');

const indexRouter = require('./routes/index');
const consoleRouter = require('./routes/console');
const apiRouter = require('./routes/api');

const User = require('./models/user').model;

const app = express();

// view engine setup

app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

//app.set('views', path.join(__dirname, 'views'));
// app.engine('handlebars', hbs({
// 	extname: '.hbs',
// 	defaultLayout: 'layout',
// 	layoutsDir: path.join(__dirname, 'views/layouts')
// }));

app.set('trust proxy', 1);

//app.use(logger('dev'));
app.use(flash());
app.use(session({
	secret: config.session.secret,
	saveUninitialized: false,
	resave: false,
	cookie: { secure: 'auto', expires: false }
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize({}));
app.use(passport.session({}));
app.use(sassMiddleware({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	indentedSyntax: false, // true = .sass and false = .scss
	sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.API) {
	app.use('/', indexRouter);
	app.use('/console/', consoleRouter);
}
else {
	app.use('/api/', apiRouter);
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

mongoose.connect(config.mongodb.uri, { useNewUrlParser: true }).then(() => {
	console.log('Connected to mongodb');
	
	// check if main admin exists
	User.findOne({ admin: true }).then((user) => {
		if (user == null) {
			config.adminExists = false;
		}
		console.log('Admin exists: ' + config.adminExists);
	});
	
}).catch(err => {
	console.log('Unable to connect to mongodb');
	console.error(err.name);
	
	//process.exit(1);
});

module.exports = app;