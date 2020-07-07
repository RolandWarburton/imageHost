const mongoose = require("mongoose");

const schema = {
	forceTags: {
		type: Boolean,
		require: false,
	},
	tags: {
		type: Array,
		require: true,
	},
	path: {
		type: String,
		require: true,
	},
	meta: {
		require: false,
		uploadDate: {
			type: Number,
			require: false,
		},
		uploadMonth: {
			type: Number,
			require: false,
		},
		uploadYear: {
			type: Number,
			require: false,
		},
		mime: {
			type: String,
			require: false,
		},
		dimensions: {
			require: false,
			width: {
				type: Number,
				require: false,
			},
			height: {
				type: Number,
				require: false,
			},
		},
	},
	_id: {
		type: String,
		require: true,
	},
	user_id: {
		type: String,
		require: true,
	},
};

const ImageSchema = mongoose.Schema(schema, {
	collection: "imageHost",
	autoCreate: true,
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = { Image, schema };

// * Example data to insert
// {
// 	"forceTags": true,
// 	"tags": ["a", "b", "c"],
// 	"img": "a.png",
// 	"id": "123"
// }
