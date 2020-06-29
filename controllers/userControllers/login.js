const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
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
			.json({ success: false, error: "missing username or password" });
	}

	User.findOne({ username: username }, (err, user) => {
		if (!user) {
			debug("user not found");
			error = true;
			return res
				.status(404)
				.json({ success: false, error: "user not found" });
		}

		if (err) {
			debug("Something went wrong finding the user");
			error = true;
			return res
				.status(500)
				.json({ success: false, error: "Something went wrong" });
		}

		if (!error && user.password == password) {
			debug("user passed authentication");
			const token = jwt.sign({ _id: user._id }, process.env.USER_KEY);
			res.header("auth-token", token);
			return res
				.status(200)
				.json({ success: true, user: user, token: token });
		} else {
			debug("users password was incorrect");
			return res
				.status(403)
				.json({ success: false, error: "wrong password" });
		}
	});
};

module.exports = login;
