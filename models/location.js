const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
	lat: Number,
	lon: Number,
	time: Date
});

module.exports = {
	model: mongoose.model('location', LocationSchema),
	schema: LocationSchema
};