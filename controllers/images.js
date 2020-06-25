const Image = require("../models/imageModel");
const fs = require("fs");
const util = require("util");
const path = require("path");
const mongoose = require("mongoose");
const Formidable = require("formidable");
const { v5: uuidv5 } = require("uuid");
const mime = require("mime-types");
const { promisify } = require("util");
const sizeOf = require("image-size");
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

const getImageById = (req, res) => {
	res.setHeader("content-type", "image/png");
	res.setHeader("accept-ranges", "bytes");
	Image.find({ _id: req.params.id }, "path")
		.cursor()
		.on("error", (err) => {
			console.log(err);
			res.status(400).json({ success: false, error: err });
		})
		.on("data", (image) => {
			res.status(200).send(fs.readFileSync(image.path));
		})
		.on("end", () => {});
};

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

const postImage = async (req, res) => {
	// create a new form
	const form = new Formidable({
		multiples: false,
		uploadDir: "./uploads",
		keepExtensions: true,
	});

	// generate a random ID to use the the filename and the _id
	const UUID = uuidv5(Math.random().toString(), uuidv5.URL);

	//rename the incoming file to the file's name
	form.on("fileBegin", function (name, file) {
		file.path = path.resolve(
			form.uploadDir,
			UUID + "." + mime.extension(file.type)
		);
	});

	// this part triggers when the fields and file are read in
	form.parse(req, (err, fields, files) => {
		// if there is a general error
		if (err) {
			next(err);
			res.status(400).json({ success: false });
			return;
		}

		// if there are too many files
		if (files.length > 0) {
			next(err);
			res.status(403).json({
				success: false,
				error: "There was too many files submitted.",
			});
			return;
		}

		// create additional time metadata
		const uploadDate = new Date();
		const uploadMonth = new Date().getMonth();
		const uploadYear = new Date().getUTCFullYear();

		// set the primary key
		fields._id = UUID;

		// add time metadata to fields
		fields.uploadDate = uploadDate;
		fields.uploadMonth = uploadDate;
		fields.uploadYear = uploadYear;

		// store the filepath to retrieve later when getting the image
		fields.path = files.image.path;

		// get the image dimensions
		const dimensions = sizeOf(files.image.path);

		// attach metadata (timestamps and image dimensions)
		fields.meta = {
			uploadDate: uploadDate,
			uploadMonth: uploadMonth,
			uploadYear: uploadYear,
			dimensions: { width: dimensions.width, height: dimensions.height },
		};

		// save the a new object to the database
		const image = new Image({ ...fields });
		image.save().then((a) => {
			console.log("success!");
			res.status(200).json({ success: true, _id: fields._id });
		});
	});
};

module.exports = {
	getImageMeta,
	getImageById,
	getImages,
	postImage,
};
