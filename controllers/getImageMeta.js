const Image = require("../models/imageModel");
require("dotenv").config();

// * get a single image
const getImageMeta = (req, res) => {
	Image.findOne({ _id: req.params.id }, "_id tags", (err, image) => {
		if (err) {
			return res.status(400).json({ success: false, error: err });
		}

		if (!image) {
			return res
				.status(404)
				.json({ success: false, error: `Image not found` });
		} else {
			res.status(200).json({
				success: true,
				data: {
					_id: image._id,
					path: image.path,
					tags: image.tags,
					imageURL: req.headers.host + "/image/" + image._id,
				},
			});
		}
	}).catch((err) => console.log(err));
};

module.exports = getImageMeta;
