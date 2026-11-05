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
const sortKeys = {
	1: { "meta.uploadDate": -1 },
	2: { "meta.uploadDate": 1 },
	3: { "meta.size": -1 },
	4: { "meta.size": 1 },
	5: { "meta.dimensions.pixels": -1 },
	6: { "meta.dimensions.pixels": 1 },
};

/** Sanitizes the per_page query to return the number of items available per page.
 * Valid values are 1 to 20; anything else falls back to the maximum of 20.
 * @param {number} per_page - The number of items available per page
 * @returns The number of items available per page
 */
const getPerPage = (per_page) => {
	per_page = Math.floor(Number(per_page));
	return per_page >= 1 && per_page <= 20 ? per_page : 20;
};

/** Return the number of items that need to be skipped
 * to get to page number. Pages are 0-indexed (?page=0 is the first page).
 * @param {number} page - The queries.page value (?page=N)
 * @param {number} per_page - The sanitized number of items per page (from getPerPage)
 * @returns The number of images to be skipped.
 */
const getSkipCount = (page, per_page) => {
	const pageNumber = Math.max(0, Math.floor(Number(page)) || 0);

	// Internally controlls how many values to skip to give the illusion of pages
	const skipCount = per_page * pageNumber;

	debug(
		`Internally skipping ${skipCount} results to get to page ${pageNumber}`
	);

	return skipCount;
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

	// ================= Queries ================================
	// ?per_page
	// how many items per page
	const per_page = getPerPage(queries.per_page);

	// Internally controlls how many values to skip to give the illusion of pages
	const skipCount = getSkipCount(queries.page, per_page);

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
