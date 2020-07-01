const jwt = require("jsonwebtoken");
const debug = require("debug")("imageHost:middleware");
require("dotenv");

const authenticate = (req, res, next) => {
	debug(`running authenticate middleware`);

	// check the auth-token given to the user after they log in
	const token = req.header("auth-token");

	if (!token) {
		debug(`Token is empty. Returning 401`);
		return res
			.status(401)
			.json({ success: false, error: "Unauthorized to do this D:" });
	} else {
		debug(`Got token from header: ${token.substring(0, 6)}...`);
	}

	try {
		// decode the token and check it with jwt
		const verified = jwt.verify(token, process.env.USER_KEY);
		debug(`Token verified as user: ${JSON.stringify(verified)}`);

		// set the user to verified. Eg. verified: {_id: "123abc", iat: 12345678}
		debug(`putting the user ${verified._id.substring(0, 6)} into req.user`);
		req.user = verified;
		next();
	} catch (err) {
		debug(`Token exists but is invalid. Returning 400`);
		return res.status(400).json({ success: false, error: "Invalid token" });
	}
};

module.exports = authenticate;
