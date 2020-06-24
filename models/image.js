const mongoose = require("mongoose");

const Image = mongoose.Schema(
	{
		forceTags: {
			type: Boolean,
			require: false,
		},
		tags: {
			type: Array,
			require: true,
		},
		img: {
			type: String,
			require: true,
		},
	},
	{ collection: "imageHost" }
);

module.exports = mongoose.model("Image", Image);
