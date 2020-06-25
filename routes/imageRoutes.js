const express = require("express");
const router = express.Router();
// const ImageController = require("../controllers/images");

const getImageMeta = require("../controllers/getImageMeta");
const getImageById = require("../controllers/getImageById");
const getImages = require("../controllers/getImages");
const postImage = require("../controllers/postImage");

// * Add help text to the router which can be printed on the "/" route
/**
 *
 * @param {Int} index - The index will be in order with how the route is declared. ie the first route declared = 0
 * @param {String} helpString - The help text to attach to this route that describes how you are supposed to use it
 */
const addHelpDescription = (index, helpString) => {
	router.stack[index].helpDescription = helpString;
};

router.get("/image/meta/:id", getImageMeta);

router.get("/image/:id", getImageById);

router.get("/images", getImages);

router.post("/image", postImage);

// Help for GET /image/meta/:id
addHelpDescription(0, "Returns the json data for a single image id");

// Help for GET /image/:id
addHelpDescription(
	1,
	"Returns an actual image (png/jpg/gif...) for an image id"
);

// Help for GET /images
addHelpDescription(
	2,
	"Returns all images limited to X amount per page. add ?page=N to get more results"
);

//help for POST /image
addHelpDescription(3, "Posts an image to the database");
module.exports = router;
