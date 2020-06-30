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
const queryUser = (username) => {
	debug("Running queryUser from db queries...");
	return User.findOne({ username: username }, (err, user) => {
		if (err) {
			debug(`An error occurred when looking for a user`);
		}

		if (!user) {
			debug(`didnt find a user ${username}`);
			return undefined;
		}

		debug(`Found user ${username}`);
		return user;
	});
};

module.exports = queryUser;
