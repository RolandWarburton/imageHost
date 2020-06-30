const mongoose = require("mongoose");

const User = mongoose.Schema(
	{
		username: {
			type: String,
			require: true,
		},
		password: {
			type: String,
			require: true,
		},
		superUser: {
			type: Boolean,
			require: true,
		},
	},
	{ collection: "users", autoCreate: true }
);

module.exports = mongoose.model("User", User);
