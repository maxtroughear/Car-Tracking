const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const isAdmin = require('./auth/middleware').isAdmin;

const User = require('../models/user').model;

router.use(isAdmin());

router.get('/', (req, res, next) => {
	User.find({}, (err, users) => {
		if (err) {
			return res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin, error: 'Unable to find users' });
		} else {
			return res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin, users: users });
		}
	});
});

module.exports = router;