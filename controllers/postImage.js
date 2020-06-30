const Image = require("../models/imageModel");
const path = require("path");
const Formidable = require("formidable");
const { v5: uuidv5 } = require("uuid");
const mime = require("mime-types");
const sizeOf = require("image-size");
const debug = require("debug")("imageHost:controllers");

require("dotenv").config();

const postImage = async (req, res) => {
	debug("Running postImage...");

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
		debug("parsing form...");
		// if there is a general error
		if (err) {
			next(err);
			res.status(400).json({ success: false });
			return;
		}

		// if there are too many files
		if (files.length > 0) {
			res.status(403).json({
				success: false,
				error: "There was too many files submitted.",
			});
			return;
		}

		// if there was no file
		if (!files.image) {
			res.status(403).json({
				success: false,
				error: "No file was submitted.",
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
			console.log("success uploading object to MongoDB!");
			res.status(200).json({
				success: true,
				_id: fields._id,
				user: req.user,
			});
		});
	});

	form.on("end", () => {
		debug("Finished processing form");
	});
};

module.exports = postImage;
