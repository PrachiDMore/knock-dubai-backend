const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	password: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
}, { timestamps: true })

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;