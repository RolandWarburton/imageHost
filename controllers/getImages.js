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

/** Map of available sorts when ?sort=N is passed as a query
 * 
 * 1: Upload Date Ascending (Newest first)
 * 2: Upload Date Descending (Oldest first)
 * 3: File Size Descending (Biggest first)
 * 4: File Size Ascending (Smallest first)
 * 5: Area of pixels Descending (Biggest first)
 * 6: Area of pixels Ascending (Smallest first)
 */
sortKeys = {
	1: { "meta.uploadDate": -1 },
	2: { "meta.uploadDate": 1 },
	3: { "meta.size": -1 },
	4: { "meta.size": 1 },
	5: { "meta.dimensions.pixels": -1 },
	6: { "meta.dimensions.pixels": 1 },
};

/** Return the number of items that need to be skipped
 * to get to page number
 * @param {number} page - The queries.page value (?page=N)
 * @param {number} per_page - The queries.per_page value (?per_page=N)
 * @returns The number of images to be skipped.
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
	skipCount = pageNumber ? numberOfItemsPerPage * pageNumber : 0;

	debug(
		`Internally skipping ${skipCount} results to get to page ${pageNumber}`
	);

	return skipCount;
};

/** Sanitizes the per_page query to return the number of items available per page, 
 * or the maximum number of items which can be returned on a page (Capped at 20) 
 * @param {number} per_page - The number of items available per page
 * @returns The number of items available per page
 */
const getPerPage = (per_page) => {
	per_page = Number(per_page);
	if (per_page <= 20) {
		return per_page;
	} else {
		return 20;
	}
};

/** The controller which returns all images.
 * 
 * @param {*} req - The request passed in from the routes.
 * @param {*} res - The response returned.
 */
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
