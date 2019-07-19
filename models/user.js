const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: { type: String, required: true },
	hash: { type: String, required: true },
	apiKey: { type: String, required: true }
}, { collection: 'users' });

module.exports = {
	model: mongoose.model('user', UserSchema),
	schema: UserSchema
};