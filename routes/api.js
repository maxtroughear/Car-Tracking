const express = require('express');
const router = express.Router();
const passport = require('passport');

const config = require('../config');

const auth = require('./auth');
const isAuthenticated = require('./auth/middleware').isAuthenticated;

const User = require('../models/user').model;
const Location = require('../models/location').model;
const Car = require('../models/car').model;

router.get('/', function (req, res, next) {
	res.redirect('/');
});

// router.get('/requestkey', (req, res) => {
// 	// check to see if an apikey has been assigned to this uuid
// 	// if yes, send it to the device
// 	// else send nothing
//
// 	Device
//
// 	return db.getAssignedAPIKey(req.query.uuid);
// });

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
			return res.end('ERROR');
		}
		
		if (!user) {
			return res.end('BAD KEY');
		}
		req.login(user, (err) => {
			if (err) {
				return res.end('LOGIN FAILED');
			}
			next();
		});
	})(req, res, next);
});

router.post('/submitlocation/:carID', (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.end('NO AUTH');
	}
	//console.log(req.params);
	//console.log(req.user);
	
	Car.findById(req.params.carID).exec((err, car) => {
		if (car == null) {
			return res.end('INVALID KEY FOR CAR');
		} else {
			Car.populate(car, { path: 'user' }, (err, car) => {
				if (!req.user._id.equals(car.user._id)) {
					return res.end('INVALID KEY FOR CAR');
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
						return res.end('BAD UPDATE');
					}
					return res.end('OK');
				});
			})
		}
	});
});

module.exports = router;