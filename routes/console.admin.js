const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uuidAPIKey = require('uuid-apikey');

//const isAdmin = require('./auth/middleware').isAdmin;

const User = require('../models/user').model;
const Car = require('../models/car').model;

function adminAuth() {
	return (req, res, next) => {
		if (req.isAuthenticated() && req.user != null) {
			if (req.user.admin) {
				return next();
			} else {
				return res.redirect('/console');
			}
		} else {
			return res.redirect('/console/login');
		}
	}
}

function adminAPIAuth() {
	return (req, res, next) => {
		if (req.isAuthenticated() && req.user != null) {
			if (req.user.admin) {
				return next();
			} else {
				return res.json({ status: 'FAILED', message: 'No Authentication' });
			}
		} else {
			return res.json({ status: 'FAILED', message: 'No Authentication' });
		}
	}
}

router.get('/', adminAuth(), (req, res, next) => {
	User.find({}, (err, users) => {
		if (err) {
			return res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin, error: 'Unable to find users' });
		} else {
			Car.find().populate('user').exec((err, cars) => {
				return res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin, users: users, cars: cars });
			});
		}
	});
});

router.post('/createaccount', adminAuth(), (req, res, next) => {
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
							admin: req.body.authlevel
						});
						
						newUser.save().then(() => {
							return res.redirect('/console/admin');
						})
					});
				}
			}
		});
	}
});

router.post('/updateaccount', adminAuth(), (req, res) => {
	res.redirect('/console/admin');
});

router.get('/deleteaccount', adminAuth(), (req, res, next) => {
	if (req.query.id == null) {
		return res.redirect('/console/admin');
	} else {
		if (mongoose.Types.ObjectId.isValid(req.query.id)) {
			User.findByIdAndDelete(req.query.id, {}, () => {
				return res.redirect('/console/admin');
			});
		}
	}
});

router.post('/createcar', adminAuth(), (req, res) => {
	if (req.body.name == null || req.body.user == null) {
		req.flash('error', 'Unable to create car');
		//res.redirect('/?register=true');
		//res.json({ status: 'FAILED', message: 'Missing info' });
		res.redirect('/console/admin');
	} else {
		Car.findOne({ name: req.body.name }).then((car, err) => {
			if (err) {
				req.flash('error', 'Unable to create car');
				//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
				res.json({ status: 'FAILED', message: 'Unable to create car' });
			} else {
				if (car != null) {
					req.flash('error', 'Unable to create account');
					//res.redirect('/?register=true&username=' + encodeURIComponent(req.body.username));
					res.json({ status: 'FAILED', message: 'Unable to create car, already exists' });
				} else {
					User.findById(req.body.user).exec((err, user) => {
						if (user != null) {
							// valid
							const newCar = new Car({
								name: req.body.name,
								user: req.body.user
							});
							
							newCar.save().then(() => {
								res.redirect('/console/admin');
							})
						}
					});
				}
			}
		});
	}
});

router.get('/deletecar', adminAuth(), (req, res, next) => {
	if (req.query.id == null) {
		return res.redirect('/console/admin');
	} else {
		if (mongoose.Types.ObjectId.isValid(req.query.id)) {
			Car.findByIdAndDelete(req.query.id, {}, () => {
				return res.redirect('/console/admin');
			});
		}
	}
});

module.exports = router;