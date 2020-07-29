const { User } = require("../../models/userModel");
const queryUser = require("../../dbQueries/queryUser");
const { validateUser } = require("../../validation/validateUser");
const debug = require("debug")("imageHost:controllers");
require("dotenv");

const createUser = async (req, res) => {
	debug("Creating a new user...");

	// get the new users details
	const username = await req.body.username;
	const password = await req.body.password;

	// when passing through a route that has authenticate middleware the req.user object is attached.
	// Eg. user: {_id: "123abc", iat: 1593527774}
	const user = await req.user;
	// get the auth-token from the header.
	// Auth tokens are supplied by the client or manually in the postman headers section
	const token = await req.header("auth-token");
	// get the supposed superuser by the _id
	const superUser = await queryUser("_id", user._id);

	// Check if the new users details are correct
	const { isVaidUser, error } = validateUser(username, password);
	if (!isVaidUser) {
		return res.status(401).json({ success: false, error: error });
	}

	// Check if there is a token
	if (!token) {
		debug("no token found");
		return res.status(401).json({
			success: false,
			error: "Missing auth-token",
		});
	}

	// check the req.user object exists
	// the req.user is attached when authenticating
	if (!user) {
		debug("no req.user found");
		return res.status(401).json({
			success: false,
			error:
				"Missing user. A superUser is required to be authenticated to create a new user",
		});
	}

	// if queryUser returns a user that is a superUser
	if (superUser.superUser) {
		// create a new user
		const newUser = new User({ username: username, password: password });
		newUser.save().then((document) => {
			debug(`new user: "${newUser.username}" has been created`);
			return res.status(200).json({ success: true, data: document });
		});
	} else {
		debug("a user was provided but they werent a superUser");
		return res.status(401).json({
			success: false,
			error:
				"A superUser is required to be authenticated to create a new user. Please pass a superUser account token",
		});
	}
};

module.exports = createUser;
