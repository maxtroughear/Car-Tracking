const mongoose = require('mongoose');

const config = require('../config');

const UserSchema = require('./user').schema;
const LocationSchema = require('./location').schema;

const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const CarSchema = new Schema({
	user: { type: ObjectId, ref: 'user', required: true },
	name: { type: String, required: true },
	locations: {
		type: [ LocationSchema ],
		validate: [ arrayLimit, '{PATH} exceeds the limit of' + config.maxLocationCount ]
	}
}, { collection: 'cars' });

function arrayLimit(val) {
	return val.length <= config.maxLocationCount;
}

module.exports = {
	model: mongoose.model('car', CarSchema),
	schema: CarSchema
};