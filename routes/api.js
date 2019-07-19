const express = require('express');
const router = express.Router();
const passport = require('passport');

const config = require('../config');

const auth = require('./auth');
const isAuthenticated = require('./auth/middleware').isAuthenticated;

const User = require('../models/user').model;
const Location = require('../models/location').model;
const Car = require('../models/car').model;

router.get('*', function (req, res, next) {
	res.redirect('/');
});

router.use((req, res, next) => {
	// check apikey
	if (req.query.apikey == null) {
		return res.json({ status: 'NO KEY' });
	}
	next();
});

router.use((req, res, next) => {
	passport.authenticate('localapikey', { session: false }, (err, user, info) => {
		if (err) {
			return res.json({ status: 'ERROR' });
		}
		
		if (!user) {
			return res.json({ status: 'BAD KEY' });
		}
		req.login(user, (err) => {
			if (err) {
				return res.json({ status: 'BAD KEY' });
			}
			next();
		});
	})(req, res, next);
});

router.post('/submitlocation/:carID', isAuthenticated(), (req, res, next) => {
	//console.log(req.params);
	//console.log(req.user);
	
	Car.findById(req.params.carID).exec((err, car) => {
		Car.populate(car, { path: 'user' }, (err, car) => {
			if (!req.user._id.equals(car.user._id)) {
				return res.json({ status: 'INVALID KEY FOR CAR' });
			}
			
			if (car.locations.length >= config.maxLocationCount) {
				car.locations.shift();
			}
			
			// update car
			car.locations.push(new Location({
				lat: req.query.lat,
				lon: req.query.lon,
				time: new Date()
			}));
			//car.user = car.user._id;
			
			car.save().then((saved, err) => {
				if (err) {
					return res.json({ status: 'BAD UPDATE', err: err });
				}
				return res.json({ status: 'OK' });
			});
		})
	});
});

module.exports = router;