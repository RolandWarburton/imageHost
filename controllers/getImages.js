const { Image } = require("../models/imageModel");
const mongoose = require("mongoose");
const debug = require("debug")("imageHost:controllers");
require("dotenv").config();

// =============================================
// =============== Valid Queries ===============
// =============================================
// ?page=N - The page number to go to
// ?per_page=N - The number of items per page
// ?tag=String

/** Return the number of items that need to be skipped
 * to get to page number
 * @param {number} page - The queries.page value (?page=N)
 * @param {number} per_page - The queries.per_page value (?per_page=N)
 */
const getSkipCount = (page, per_page) => {
	// get the per_page query and convert it to a number to set the numberOfItemsPerPage
	per_page = Number(per_page);

	// Set the number of items per page to the ?per_page=n if its between 10 and 100
	const numberOfItemsPerPage =
		per_page && per_page >= 10 && per_page <= 100 ? per_page : 20;

	//get the page number and convert it to a number
	const pageNumber = Number(page);

	// Internally controlls how many values to skip to give the illusion of pages
	skipCount = pageNumber ? numberOfItemsPerPage * pageNumber : 0;

	debug(
		`Internally skipping ${skipCount} results to get to page ${pageNumber}`
	);

	return skipCount;
};

const getper_page = (per_page) => {
	per_page = Number(per_page);
	if (per_page <= 20) {
		return per_page;
	} else {
		return 20;
	}
};

// * get all images
const getImages = async (req, res) => {
	debug("Running getImages...");

	const filters = {};
	const queries = req.query;
	debug(`Received queries ${JSON.stringify(queries)}`);

	// attach the user id for filtering just the users pictures
	debug(`Verified deets: ${JSON.stringify(res["auth-token"]._id)}`);

	filters.user_id = res["auth-token"]._id;

	// Internally controlls how many values to skip to give the illusion of pages
	const skipCount = getSkipCount(queries.page, queries.per_page);

	// ================= Queries ================================
	// ?per_page
	// how many items per page
	const per_page = getper_page(queries.per_page);

	// ?tags
	// return just images with this tag. may be an array if theres multiple images
	const tags = queries.tag;

	// ================= Attach tags is parsed =================
	// if there are tags, append them to the query filters
	if (tags) filters.tags = { $in: tags };

	// ================= Run the query =========================
	try {
		const images = await Image.find(filters, "meta.uploadDate id tags", {
			sort: "meta.uploadDate",
			skip: skipCount,
			limit: per_page,
		});

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
		return res.status(200).json({ success: true, data: images });
	} catch (err) {
		return res.status(400).json({ success: false, error: err });
	}
};

module.exports = getImages;

// images[0].test = new mongoose.Types.ObjectId().getTimestamp();
