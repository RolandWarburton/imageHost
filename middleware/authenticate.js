const jwt = require("jsonwebtoken");
require("dotenv");

const authenticate = (req, res, next) => {
	// check the auth-token given to the user after they log in
	const token = req.header("auth-token");

	if (!token) {
		return res
			.status(401)
			.json({ success: false, error: "Unauthorized to do this D:" });
	}

	try {
		const verified = jwt.verify(token, process.env.USER_KEY);
		req.user = verified;
		next();
	} catch (err) {
		return res.status(400).json({ success: false, error: "Invalid token" });
	}
};

module.exports = authenticate;
