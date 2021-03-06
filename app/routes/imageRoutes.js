const express = require("express");
const router = express.Router();

const getImageMeta = require("../controllers/getImageMeta");
const getImageById = require("../controllers/getImageById");
const getImages = require("../controllers/getImages");
const postImage = require("../controllers/postImage");
const deleteImageById = require("../controllers/deleteImageById");
const authenticate = require("../middleware/authenticate");
const buildRouter = require("./buildRouter");

const routes = [
	{
		path: "/images",
		method: "get",
		middleware: [authenticate],
		requiresAuthentication: true,
		handler: getImages,
		help: {
			description: "get ALL images",
			method: "get",
			queries: [
				"?page=N - The page number to go to",
				"?per_page=N - The number of items per page",
				"?tag=String",
				"?include_all_users=true",
				"?sort=Number",
				"?user=String",
			],
			sorting: [
				"1: Upload Date Ascending (Newest first)",
				"2: Upload Date Descending (Oldest first)",
				"3: File Size Descending (Biggest first)",
				"4: File Size Ascending (Smallest first)",
				"5: Area of pixels Descending (Biggest first)",
				"6: Area of pixels Ascending (Smallest first)",
			],
			example: "/images?page=0&sort=3",
		},
	},
	{
		path: "/upload",
		method: "post",
		middleware: [authenticate],
		requiresAuthentication: true,
		handler: postImage,
		help: {
			description:
				"Posts an image to the database. requires a JWT token from the /login route",
			method: "post",
			formOptions: {
				forceTags: "Boolean",
				tags: "Array",
				path: "String",
				meta: {
					uploadDate: "Number",
					uploadMonth: "Number",
					uploadYear: "Number",
					mime: "String",
					size: "Number",
					dimensions: {
						width: "Number",
						height: "Number",
						pixels: "Number",
					},
				},
				_id: "String",
				user_id: "String",
			},
			example: "/image",
		},
	},
	{
		path: "/meta/:id",
		method: "get",
		middleware: [],
		handler: getImageMeta,
		help: {
			description: "get an images meta in json",
			method: this.method,
			parameters: ":id -> ID of an image",
			example: "/image/meta/124944bc-7ee6-5222-8096-59f56da28bcb",
		},
	},
	{
		path: "/:id",
		method: "get",
		middleware: [],
		handler: getImageById,
		help: {
			description:
				"Returns an actual image (png/jpg/gif...) for an image id",
			method: "get",
			parameters: ":id -> ID of an image",
			example: "/124944bc-7ee6-5222-8096-59f56da28bcb",
		},
	},
	{
		path: "/:id",
		method: "delete",
		middleware: [authenticate],
		requiresAuthentication: true,
		handler: deleteImageById,
		help: {
			description:
				"Deletes an image and removes it from the uploads dir on the server",
			method: "delete",
			parameters: ":id -> ID of an image",
			example: "/image/124944bc-7ee6-5222-8096-59f56da28bcb",
		},
	}
];

// show the help json when the image route is hit
// remove the middleware
router.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		commands: routes.filter((route) => {
			delete route.middleware;
			return route;
		}),
	});
});

// build the router!
buildRouter(router, routes);

module.exports = router;
