const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone_number: {
		type: String,
		required: true
	},
	query: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
}, { timestamps: true })

const ContactModel = mongoose.model("contact", ContactSchema);
module.exports = ContactModel;