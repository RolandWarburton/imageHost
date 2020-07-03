const { User } = require("../../models/userModel");
const queryUser = require("../../dbQueries/queryUser");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../../validation/validateUser");
const { logger } = require("../../logger");
const debug = require("debug")("imageHost:controllers");

const login = async (req, res) => {
	// get the username and password from the body (x-www-form-urlencoded)
	const username = req.body.username;
	const password = req.body.password;

	// Check if the new users details are correct
	const { isVaidUser, error } = validateUser(username, password);
	if (!isVaidUser) {
		return res.status(401).json({ success: false, error: error });
	}

	const user = await queryUser("username", username);

	// check if the user was retrieved from the database
	if (!user) {
		return res.status(401).json({
			success: false,
			error: `Could not find user ${username}`,
		});
	}

	// Check the password is correct
	if (user.password != password) {
		return res.status(401).json({
			success: false,
			error: `Wrong password for ${username}`,
		});
	}

	// sign a token for the user
	debug("Signing a new token for the user");
	const token = jwt.sign({ _id: user._id }, process.env.USER_KEY);

	// put the signed token in the response header
	debug("putting the auth-token into the res.header");
	res.header("auth-token", token);

	// return 200 all good and attach the user and token
	return res.status(200).json({ success: true, user: user, token: token });
};

module.exports = login;
