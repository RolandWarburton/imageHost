const User = require("../models/userModel");
const debug = require("debug")("imageHost:query");
require("dotenv").config();

// * get a users info from the users table
/** Returns a promise that resolves to an object from the imageHost.users database
 * or null if not found
 * @example
 * queryUser("roland");
 * @param {string} username - mongoDB username of the user to lookup
 */
const queryUser = async (username) => {
	debug("Running queryUser from db queries...");
	return User.findOne({ username: username }, (err, user) => {
		if (!user) {
			return;
		}
		return user;
	});
};

module.exports = queryUser;
