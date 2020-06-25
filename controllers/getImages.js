const Image = require("../models/imageModel");
const mongoose = require("mongoose");
require("dotenv").config();

// * get all images
const getImages = (req, res) => {
	const numberOfItemsPerPage = 10;
	const queries = req.query;

	// Internally controlls how many values to skip to give the illusion of pages
	skipCount = queries.page ? numberOfItemsPerPage * queries.page : 0;

	Image.find(
		{},
		"meta.uploadDate id tags",
		{
			sort: "meta.uploadDate",
			skip: skipCount,
			limit: numberOfItemsPerPage,
		},
		(err, images) => {
			// if there is a general error
			if (err) {
				return res.status(400).json({ success: false, error: err });
			}

			if (!images.length) {
				return res.status(404).json({
					success: false,
					error:
						"Images not found. Perhaps the database is empty, or you have specified a page number thats too high?",
				});
			}

			// images.meta.uploadDate = new Date(parseInt(images.meta.uploadDate));
			for (img of images) {
				const t = new Date(img.meta.uploadDate).toISOString();
				img.test = new mongoose.Types.ObjectId().getTimestamp();
			}

			images[0].test = new mongoose.Types.ObjectId().getTimestamp();

			return res.status(200).json({ success: true, data: images });
		}
	).catch((err) => console.log(err));
};

module.exports = getImages;
