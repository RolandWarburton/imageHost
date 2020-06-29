const User = require("../../models/userModel");
const debug = require("debug")("imageHost:controllers");

const createUser = (req, res) => {
	console.log(req.body);
	const username = req.body.username;
	const password = req.body.password;

	if (!username || !password) {
		return res
			.status(400)
			.json({ success: false, error: "missing username or password" });
	}

	const user = new User({ username: username, password: password });
	debug("new user:");
	debug(user.username);
	user.save().then((document) => {
		return res.status(200).json({ success: true, data: document });
	});
};

module.exports = createUser;
