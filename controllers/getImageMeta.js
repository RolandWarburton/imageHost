const { Image } = require("../models/imageModel");
const getImageMetaQuery = require("../dbQueries/queryImageMeta");
const debug = require("debug")("imageHost:controllers");
require("dotenv").config();

// * get a single image
const getImageMeta = (req, res) => {
	debug("Running getImageMeta...");

	getImageMetaQuery(req.params.id)
		.then((imageMeta) => {
			if (imageMeta) {
				// return the image meta ✅
				debug(`image meta returned`);
				return res.status(200).json(imageMeta);
			} else {
				// something went wrong ⛔
				debug(`ERROR: failed to get image meta`);
				return res
					.status(404)
					.json({ success: false, error: `Image not found` });
			}
		})
		.catch((err) => {
			debug(`ERROR: Something went wrong: ${err}`);
		});
};

module.exports = getImageMeta;
