const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LocalAPIStrategy = require('passport-localapikey').Strategy;
const bcrypt = require('bcrypt');
const uuidAPIKey = require('uuid-apikey');

const auth = require('./auth');

const isAuthenticated = require('./auth/middleware').isAuthenticated;

const User = require('../models/user').model;

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('console/login');
	} else {
		res.render('console', { carlist: ['test car', 'test 2', 'test 3'] });
	}
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

router.post('/login', function(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			req.flash('error', 'Unexpected error occurred');
			res.redirect('/');
		}
		if (!user && req.body.username != null) {
			req.flash('error', 'Invalid username or password');
			return res.redirect('/console/login?username=' + encodeURIComponent(req.body.username));
		} else if (!user && req.body.password != null) {
			req.flash('error', 'Invalid email or password');
			return res.redirect('/console/login');
		} else {
			req.login(user, (err) => {
				if (err) {
					res.redirect('/console/login?username=' + encodeURIComponent(req.body.username));
				}
				return res.redirect('/console');
			});
		}
	})(req, res, next);
});

router.post('/createaccount', function(req, res, next) {
	if (req.body.username == null || req.body.password == null || req.body.confirmpassword == null) {
		req.flash('error', 'Unable to create account');
		//res.redirect('/?register=true');
		res.json({ status: 'FAILED', message: 'Missing info' });
	} else if (req.body.password !== req.body.confirmpassword) {
		req.flash('error', 'Unable to create account. Passwords don\'t match');
		//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
		res.json({ status: 'FAILED', message: 'Passwords don\'t match' });
	} else {
		User.findOne({ username: req.body.username }).then((user, err) => {
			if (err) {
				req.flash('error', 'Unable to create account');
				//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
				res.json({ status: 'FAILED', message: 'Unable to create account' });
			} else {
				if (user != null) {
					req.flash('error', 'Unable to create account');
					//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
					res.json({ status: 'FAILED', message: 'Unable to create account' });
				} else {
					bcrypt.hash(req.body.password, 10, (err, hash) => {
						// generate apikey
						
						const uuidAPI = uuidAPIKey.create();
						
						const newUser = new User({
							username: req.body.username,
							hash: hash,
							uuid: uuidAPI.uuid
						});
						
						newUser.save().then((savedUser) => {
							req.login(savedUser, (err) => {
								if (err) {
									return next(err);
								}
								return res.json({ status: 'OK', key: uuidAPI.apiKey });
							})
						})
					});
				}
			}
		});
	}
});

module.exports = router;