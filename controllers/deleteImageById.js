const Image = require("../models/imageModel");
const fs = require("fs");
const path = require("path");
const debug = require("debug")("imageHost:controllers");
const queryImageMeta = require("../dbQueries/queryImageMeta");
require("dotenv").config();

const deleteFile = (filepath) => {
	debug(`Deleting image from the filesystem`);

	// now try and delete the file
	fs.unlink(filepath, (err) => {
		if (err) {
			debug("ERROR: Failed to delete image from the filesystem");
		} else {
			debug("Successfully deleted image from the filesystem");
		}
	});
};

// * Delete a single image
const deleteImageById = async (req, res) => {
	const meta = await queryImageMeta(req.params.id);

	try {
		debug("Attempting to delete image...");
		Image.deleteOne({ _id: req.params.id }, (err, image) => {
			debug(`queryDeleteImage returned ${JSON.stringify(image)}`);

			// Check if an item was deleted ✅
			if (image.deletedCount > 0) {
				debug(`deleted image ${req.params.id}`);
				deleteFile(meta.path);
				return res
					.status(200)
					.json({ success: true, error: `deleted ${req.params.id}` });
			}

			// Check for error ❌
			if (err) {
				debug(`error: ${err}`);
				return res.status(500).json({
					success: true,
					error: `something went very wrong deleting an image D:`,
				});
			}

			// Delete ran successfully but didnt find anything ❌
			if (image.deletedCount == 0) {
				debug(`image 404: ${req.params.id}`);
				return res.status(404).json({
					success: false,
					error: `failed to delete ${req.params.id}. Most liekly the object didnt exist`,
				});
			}
		});
	} catch (err) {
		debug(`ERROR removing image: ${err}`);
		return err;
	}
};

module.exports = deleteImageById;
