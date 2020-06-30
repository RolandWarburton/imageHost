const User = require("../models/userModel");
const debug = require("debug")("imageHost:query");
require("dotenv").config();

// * get a single images meta
/** Returns a promise that resolves to an object from the imageHost.imageHost database
 * or undefined if not found
 * @example
 * queryImageMeta("55d6800f-43ff-5519-aba6-c100a0e9cad9");
 * @param {string} id - mongoDB _id of object to lookup
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
