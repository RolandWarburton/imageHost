const User = require("../../models/userModel");
const queryUser = require("../../dbQueries/queryUser");
const debug = require("debug")("imageHost:controllers");
require("dotenv");

// TODO make this use async/await to make it c l e a n
const createUser = (req, res) => {
	debug("Creating a new user...");

	// get the new users details
	const username = req.body.username;
	const password = req.body.password;

	const user = req.user;
	if (!user) {
		return res.status(400).json({
			success: false,
			error:
				"missing an auth-token. Please add an auth-token to the header",
		});
	}

	debug(`user: ${JSON.stringify(user)}`);
	debug(`checking if ${user._id} is a super user`);

	queryUser("_id", user._id).then((user) => {
		// thrrow error if account is missing
		if (!user) {
			debug("ERROR: Missing account or possibly invalid token");
			return res.status(401).json({
				success: false,
				error: "This account is missing somehow?",
			});
		}

		// throw 401 if the auth-token provided is not a superUsers
		if (!user.superUser) {
			return res.status(401).json({
				success: false,
				error:
					"The auth-token provided to create a new user is not a superUser and so cannot be used to generate a new account",
			});
		}

		if (!username || !password) {
			return res.status(400).json({
				success: false,
				error: "missing username or password",
			});
		}

		const newUser = new User({ username: username, password: password });
		newUser.save().then((document) => {
			debug(`new user: "${newUser.username}" has been created`);
			return res.status(200).json({ success: true, data: document });
		});
	});
};

module.exports = createUser;
