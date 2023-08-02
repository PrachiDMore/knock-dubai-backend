const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
	author: {
		type: String,
		required: true
	},
	tags: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	mainImg: {
		type: String,
		required: true,
	},
	otherImgs: {
		type: [String]
	},
	timeReq: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	}
}, { timestamps: true })

const BlogModel = mongoose.model("blog", BlogSchema);
module.exports = BlogModel;