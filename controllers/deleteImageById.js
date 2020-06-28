const Image = require("../models/imageModel");
require("dotenv").config();

// * Delete a single image
const deleteImageById = (req, res) => {
	Image.deleteOne({ _id: req.params.id }, function (err, image) {
		if (err) {
			return res.status(500).json({
				success: false,
				error: `Something went wrong. thats bad!`,
			});
		}

		if (image.deletedCount == 0) {
			return res.status(404).json({
				success: false,
				error: `Couldnt find the item ${req.params.id}`,
			});
		}

		return res.json({ success: true, error: `deleted` });
	}).catch((err) => console.log(err));
};

module.exports = deleteImageById;
