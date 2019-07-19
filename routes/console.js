const express = require('express');
const router = express.Router();

const auth = require('./auth');

const isAuthenticated = require('./auth/middleware').isAuthenticated;

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('console/login');
	}
});

router.get('/login', function(req, res, next) {
	res.end('login');
});

module.exports = router;
