const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const LocalAPIStrategy = require('passport-localapikey').Strategy;

//const authenticationMiddleware = require('./middleware');

const User = require('../../models/user').model;

passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	(username, password, done) => {
		User.findOne({ username: username }).then((user, err) => {
			if (err) {
				return done(err, false);
			} else {
				if (user == null) {
					return done(null, false);
				}
				if (user.username !== username) {
					return done(null, false);
				}
				bcrypt.compare(password, user.hash, (err, compare) => {
					if (compare !== true) {
						return done(null, false);
					} else {
						return done(null, user);
					}
				});
			}
		});
	}
));

passport.use(new LocalAPIStrategy((key, done) => {
	User.findOne({ apiKey: key }).then((user, err) => {
		if (err) {
			return done(err);
		} else {
			if (user == null) {
				return done(null, false);
			}
			if (user.apiKey !== key) {
				return done(null, false);
			}
			return done(null, user);
		}
	});
}));

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});