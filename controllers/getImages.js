const Image = require("../models/imageModel");
const mongoose = require("mongoose");
const debug = require("debug")("imageHost:controllers");
require("dotenv").config();

// * get all images
const getImages = (req, res) => {
	debug("Running getImages...");

	const queries = req.query;
	debug(`Received queries ${JSON.stringify(queries)}`);

	// get the limit query and convert it to a number to set the numberOfItemsPerPage
	const limit = Number(queries.limit);

	// Set the number of items per page to the ?limit=n if its between 10 and 100
	const numberOfItemsPerPage =
		limit && limit >= 10 && limit <= 100 ? limit : 20;

	//get the page number and convert it to a number
	const pageNumber = Number(queries.page);

	// Internally controlls how many values to skip to give the illusion of pages
	skipCount = pageNumber ? numberOfItemsPerPage * pageNumber : 0;

	debug(
		`Internally skipping ${skipCount} results to get to page ${pageNumber}`
	);

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
