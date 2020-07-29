const mongoose = require("mongoose");

const schema = {
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
};

// const User = mongoose.Schema(schema, { collection: "users", autoCreate: true });

// module.exports = mongoose.model("User", User);

const UserSchema = mongoose.Schema(schema, {
	collection: "users",
	autoCreate: true,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, schema };
