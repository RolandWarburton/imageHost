const debug = require("debug")("imageHost:controllers");

// Log a user out by clearing their auth cookies
const logout = (req, res) => {
	debug("Logging a user out...");
	res.clearCookie("auth-token");
	res.clearCookie("user");
	return res.status(200).json({ success: true });
};

module.exports = logout;
