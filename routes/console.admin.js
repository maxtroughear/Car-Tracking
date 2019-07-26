const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uuidAPIKey = require('uuid-apikey');

//const isAdmin = require('./auth/middleware').isAdmin;

const User = require('../models/user').model;

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
			return res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin, users: users });
		}
	});
});

router.post('/createaccount', adminAPIAuth(), (req, res, next) => {
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
							name: req.body.name,
							hash: hash,
							uuid: uuidAPI.uuid,
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

module.exports = router;