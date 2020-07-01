const Image = require("../models/imageModel");
const path = require("path");
const Formidable = require("formidable");
const Busboy = require("busboy");
const { v5: uuidv5 } = require("uuid");
const mime = require("mime-types");
const sizeOf = require("image-size");
const fs = require("fs");
const util = require("util");
const debug = require("debug")("imageHost:controllers");

require("dotenv").config();

const filetypes = ["png", "jpg", "jpeg", "svg", "gif", "mp4", "webm"];

const getFilepathDetails = (mimetype, uuid) => {
	// make a random filename
	const filehash = uuid;

	// get the extension
	const fileExtension = mime.extension(mimetype);

	// get the filepath including the file itself
	const saveFilepath = path.resolve(
		process.env.UPLOAD_DIRECTORY_LOCATION,
		filehash + "." + fileExtension
	);

	return {
		filehash: filehash,
		fileExtension: fileExtension,
		saveFilepath: saveFilepath,
	};
};

const getFileDimensions = (file) => {
	debug(sizeOf(file));
};

const getdim = util.promisify(sizeOf);

const postImage = (req, res) => {
	debug("Running postImage...");

	const image = new Image();
	let postedImage = false;
	const UUID = uuidv5(Math.random().toString(), uuidv5.URL);

	// 100MB filesize limit
	const busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: 1,
			fileSize: 100 * 1024 * 1024,
		},
	});

	// * ============================== On File ==============================
	busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
		const { saveFilepath, fileExtension } = getFilepathDetails(
			mimetype,
			UUID
		);
		// getFileDimensions(file);
		// if (fieldname != "image")
		if (filetypes.includes(fileExtension)) {
			debug("saving...");
			postedImage = true;
			image.path = saveFilepath;

			const f = fs.createWriteStream(saveFilepath);
			file.pipe(f);
			// f.on("finish", () => {
			// });
		} else {
			res.status(400).json({
				success: false,
				error: "Wrong image format",
			});
			res.end();
		}
	});

	// * ============================== On Field ==============================
	busboy.on("field", function (
		fieldname,
		val,
		fieldnameTruncated,
		valTruncated,
		encoding,
		mimetype
	) {
		// stick this field onto the image object
		image[fieldname] = val;
	});

	// * ============================== On Finish ==============================
	busboy.on("finish", async () => {
		if (!postedImage) {
			// respond with 400 ❌
			res.status(400).json({
				success: false,
				error: "No image provided.",
			});
		}

		// set meta
		image.meta.uploadDate = new Date();
		image.meta.uploadMonth = new Date().getMonth();
		image.meta.uploadYear = new Date().getUTCFullYear();

		// get the dimension meta
		image.meta.dimensions = await getdim(image.path);

		// set the id
		image._id = UUID;

		debug(image);

		// respond all good ✅
		res.status(200).json({ success: true });
		res.end();
	});

	// Connects this read stream to busboy WriteStream to write the file and do other things
	// https://nodejs.org/docs/v0.4.8/api/streams.html#stream.pipe
	return req.pipe(busboy);

	// generate a random ID to use the the filename and the _id
	// const UUID = uuidv5(Math.random().toString(), uuidv5.URL);
	// const extension = mime.extension(part.type);
};

module.exports = postImage;
