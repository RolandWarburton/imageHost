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
	},
	{ collection: "imageHost" }
);

module.exports = mongoose.model("Image", Image);

// * Example data to insert
// {
// 	"forceTags": true,
// 	"tags": ["a", "b", "c"],
// 	"img": "a.png",
// 	"id": "123"
// }
