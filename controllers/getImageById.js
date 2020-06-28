const Image = require("../models/imageModel");
const fs = require("fs");
const debug = require("debug")("imageHost:controllers");
require("dotenv").config();

const getImageById = (req, res) => {
	debug("Running getImageById...");
	res.setHeader("content-type", "image/png");
	res.setHeader("accept-ranges", "bytes");
	Image.find({ _id: req.params.id }, "path")
		.cursor()
		.on("error", (err) => {
			debug("ERROR: deleteImageById had a general error");
			res.status(400).json({ success: false, error: err });
		})
		.on("data", (image) => {
			res.status(200).send(fs.readFileSync(image.path));
		})
		.on("end", () => {});
};

module.exports = getImageById;
