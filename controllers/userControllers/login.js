const User = require("../../models/userModel");
const queryUser = require("../../dbQueries/queryUser");
const jwt = require("jsonwebtoken");
const { logger } = require("../../logger");
const debug = require("debug")("imageHost:controllers");

const login = (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let error = false;

	if (!username || !password) {
		debug("username or password was not provided");
		error = true;
		return res
			.status(400)
			.json({ success: false, error: "Missing username or password" });
	}

	queryUser(username)
		.then((user) => {
			if (!user) {
				throw "User was found";
			}

			if (!error && user.password == password) {
				debug("user passed authentication");

				// sign a token for the user
				const token = jwt.sign({ _id: user._id }, process.env.USER_KEY);

				// put the signed token in the response header
				res.header("auth-token", token);

				// return a success message with the user and the token
				return res
					.status(200)
					.json({ success: true, user: user, token: token });
			} else {
				debug("users password was incorrect");
				return res
					.status(403)
					.json({ success: false, error: "wrong password" });
			}
		})
		.catch((err) => {
			debug(err);
			logger.error(err);
			return res.status(404).json({ success: false, error: err });
		});
};

module.exports = login;
