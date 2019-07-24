const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const isAdmin = require('./auth/middleware').isAdmin;

router.use(isAdmin());

router.get('/', (req, res, next) => {
	res.render('admin', { title: 'Admin Console', adminAccess: req.user.admin });
});

module.exports = router;