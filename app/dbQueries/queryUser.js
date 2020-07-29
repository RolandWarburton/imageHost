const { User } = require("../models/userModel");
const debug = require("debug")("imageHost:query");
require("dotenv").config();

// * get a users info from the users table
/** Returns a promise that resolves to an object from the imageHost.users database
 * or null if not found
 * @example
 * queryUser("username", "roland");
 * @param {string} queryField - The key to lookup. Eg. "username"
 * @param {string} queryValue - The value to loopup. Eg. "roland"
 */
const queryUser = (queryField, queryValue) => {
	debug("Running queryUser from db queries...");
	debug(`Looking for user where ${queryField} = ${queryValue}`);
	return User.findOne({ [queryField]: queryValue }, (err, user) => {
		if (err) {
			debug(`An error occurred when looking for a user`);
		}

		if (!user) {
			debug(`didnt find a user ${queryValue}`);
			return undefined;
		}

		debug(`Found user ${user.username}`);
		return user;
	});
};

module.exports = queryUser;
