const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uuidAPIKey = require('uuid-apikey');

const adminRouter = require('./console.admin');

//const auth = require('./auth');

const isAuthenticated = require('./auth/middleware').isAuthenticated;

const config = require('../config');


const User = require('../models/user').model;
const Car = require('../models/car').model;

/* GET home page. */
// router.get('/', (req, res, next) => {
// 	if (!req.isAuthenticated()) {
// 		res.redirect('console/login');
// 	} else {
// 		Car.find({ user: req.user._id }, (err, cars) => {
// 			if (err) {
// 				res.render('console');
// 			} else {
// 				res.render('console', { carlist: cars });
// 			}
// 		});
// 	}
// });

router.use('/admin', adminRouter);

router.get('/login', (req, res, next) => {
	if (config.adminExists)
		res.render('login', { title: 'Login' });
	else {
		res.redirect('/console/firstaccount');
	}
});

router.get('/firstaccount', (req, res, next) => {
	if (config.adminExists)
		res.redirect('/console/login');
	else {
		res.render('register', { title: 'First Account' });
	}
});

router.post('/firstaccount', (req, res, next) => {
	if (config.adminExists) {
		res.json({ status: 'INVALID REQUEST' });
	} else {
		if (req.body.username == null || req.body.name == null || req.body.password == null || req.body.confirmpassword == null) {
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
					res.json({ status: 'FAILED', message: 'Unable to create account error' });
				} else {
					if (user != null) {
						req.flash('error', 'Unable to create account');
						//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
						res.json({ status: 'FAILED', message: 'Unable to create account user exists' });
					} else {
						bcrypt.hash(req.body.password, 10, (err, hash) => {
							// generate apikey
							
							const uuidAPI = uuidAPIKey.create();
							
							const newUser = new User({
								username: req.body.username,
								name: req.body.name,
								hash: hash,
								uuid: uuidAPI.uuid,
								apikey: uuidAPI.apiKey,
								admin: true
							});
							
							newUser.save().then(() => {
								return res.redirect('/console');
							})
						});
					}
				}
			});
		}
	}
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			req.flash('error', 'Unexpected error occurred');
			return res.redirect('/');
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
					return res.redirect('/console/login?username=' + encodeURIComponent(req.body.username));
				}
				return res.redirect('/console');
			});
		}
	})(req, res, next);
});

router.get('/getlocation', (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.json({ status: 'NO AUTH' });
	} else {
		if (req.query.carID == null) {
			return res.json({ status: 'BAD ID' });
		}
		if (mongoose.Types.ObjectId.isValid(req.query.carID)) {
			Car.findById(req.query.carID).then((doc) => {
				if (doc) {
					if (doc.user.equals(req.user._id)) {
						return res.json({ status: 'OK', locations: doc.locations });
					} else {
						return res.json({ status: 'INVALID AUTH' });
					}
				} else {
					return res.json({ status: 'NO DATA' });
				}
			});
		} else {
			return res.json({ status: 'INVALID ID' });
		}
	}
});

router.get('/:carID?', (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.redirect('/console/login');
	} else {
		Car.find({ user: req.user._id }, (err, cars) => {
			if (err) {
				res.render('console', { title: 'Console', adminAccess: req.user.admin });
			} else {
				for (let i = 0; i < cars.length; i++) {
					cars[i].stringID = cars[i].id;
				}
				
				if (req.params.carID != null) {
					Car.findById(req.params.carID).exec((err, car) => {
						if (car == null) {
							res.redirect('/console');
						} else {
							res.render('console', {
								title: car.name,
								carlist: JSON.parse(JSON.stringify(cars)),
								currentcar: JSON.parse(JSON.stringify(car)),
								adminAccess: req.user.admin
							});
						}
					});
				} else {
					res.render('console', {
						title: 'Console', carlist: cars,
						adminAccess: req.user.admin
					});
				}
			}
		});
	}
});

module.exports = router;