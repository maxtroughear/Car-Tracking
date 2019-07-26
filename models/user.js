const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: { type: String, required: true },
	name: { type: String, required: true },
	hash: { type: String, required: true },
	uuid: { type: String, required: true },
	admin: { type: Boolean, default: false }
}, { collection: 'users' });

module.exports = {
	model: mongoose.model('user', UserSchema),
	schema: UserSchema
};