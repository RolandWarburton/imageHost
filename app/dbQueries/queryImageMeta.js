const { Image } = require("../models/imageModel");
const debug = require("debug")("imageHost:query");
require("dotenv").config();

// * get a single images meta
/** Returns a promise that resolves to an object from the imageHost.imageHost database
 * or undefined if not found
 * @example
 * queryImageMeta("55d6800f-43ff-5519-aba6-c100a0e9cad9");
 * @param {string} id - mongoDB _id of object to lookup
 */
const queryImageMeta = async (id) => {
	debug("Running getImageMeta from db queries...");
	try {
		const image = await Image.findOne({ _id: id }, "_id tags path").exec();
		if (!image) {
			debug("ERROR no image found");
			return undefined;
		}
		debug("Returning image meta");
		return image;
	} catch (err) {
		debug(`ERROR retrieving image meta from mongo ${err}`);
		return undefined;
	}
};

module.exports = queryImageMeta;
