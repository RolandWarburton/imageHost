const { Image } = require("../models/imageModel");
const mongoose = require("mongoose");
const debug = require("debug")("imageHost:controllers");
const queryUser = require("../dbQueries/queryUser");
require("dotenv").config();

// =============================================
// =============== Valid Queries ===============
// =============================================
// ?page=N - The page number to go to
// ?per_page=N - The number of items per page
// ?tag=String
// ?include_all_users=true
// ?sort=Number
// ?user=String

const sortKeys = {
	1: { "meta.uploadDate": -1 }, // Upload Date Ascending (newest first)
	2: { "meta.uploadDate": 1 }, // Upload Date Descending (oldest first)
	3: { "meta.size": -1 }, // File Size Descending (biggest first)
	4: { "meta.size": 1 }, // FIle Size Ascending (smallest first)
	5: { "meta.dimensions.pixels": -1 }, // Area of width * height Descending (biggest first)
	6: { "meta.dimensions.pixels": 1 }, // Area of width * height Ascending (smallest first)
};

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
		per_page && per_page >= 1 && per_page <= 100 ? per_page : 100;

	//get the page number and convert it to a number
	const pageNumber = Number(page) || 0;

	// Internally controlls how many values to skip to give the illusion of pages
	const skipCount = pageNumber ? numberOfItemsPerPage * pageNumber : 0;

	debug(
		`Internally skipping ${skipCount} results to get to page ${pageNumber}`
	);

	return skipCount;
};

const getPerPage = (per_page) => {
	per_page = Number(per_page);
	if (per_page <= 20) {
		return per_page;
	} else {
		return 20;
	}
};

// * ================================
// * get all images
// * ================================
const getImages = async (req, res) => {
	debug("Running getImages...");

	const filters = {};
	const queries = req.query;
	debug(`Received queries ${JSON.stringify(queries)}`);

	// attach the user id for filtering just the users pictures
	debug(`Verified deets: ${JSON.stringify(res.user._id)}`);

	// get the user details
	const user = await queryUser("_id", res.user._id);
	const isSuperUser = await user.superUser;

	filters.user_id = user._id;
	// check if the authenticated user is a superUser
	// if ?include_all_users is passed then all users pictures are shown
	if (isSuperUser && queries.include_all_users === "") {
		// change the user_id filter to undefiend for the mongodb query
		// this will result in ALL users images being shown
		filters.user_id = queries.user || undefined;
	}

	// Internally controlls how many values to skip to give the illusion of pages
	const skipCount = getSkipCount(queries.page, queries.per_page);

	// ================= Queries ================================
	// ?per_page
	// how many items per page
	const per_page = getPerPage(queries.per_page);

	// ?tags
	// return just images with this tag. may be an array if theres multiple images
	const tags = queries.tag;

	// ================= Attach tags is parsed =================
	// if there are tags, append them to the query filters
	if (tags) filters.tags = { $in: tags };

	debug(`filters: ${JSON.stringify(filters)}`);

	// ================= Run the query =========================
	try {
		const images = await Image.find(filters, "-path", {
			sort: sortKeys[queries.sort],
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
		for (let img of images) {
			// get the actual time as a string
			// const time = new Date(img.meta.uploadDate).toISOString();
			img.test = new mongoose.Types.ObjectId().getTimestamp();
		}
		return res.status(200).json({ success: true, data: images });
	} catch (err) {
		return res.status(400).json({ success: false, error: err });
	}
};

module.exports = getImages;
