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

const imageFiletypes = ["gif", "ico", "bmp", "jpeg", "png", "svg"];
const mediaFiletypes = ["mp4", "webm"];

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
	busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
		const { saveFilepath, fileExtension } = getFilepathDetails(
			mimetype,
			UUID
		);

		if (
			!imageFiletypes.includes(fileExtension) &&
			!mediaFiletypes.includes(fileExtension)
		) {
			res.status(400).json({
				success: false,
				error: "Wrong image format",
			});
			res.end();
		}

		postedImage = true;
		image.path = saveFilepath;

		const f = fs.createWriteStream(saveFilepath);
		file.pipe(f);
		f.on("finish", () => {
			debug(`saved image to filesystem`);
		});
	});

	// * ============================== On Field ==============================
	busboy.on(
		"field",
		(
			fieldname,
			val,
			fieldnameTruncated,
			valTruncated,
			encoding,
			mimetype
		) => {
			// stick this field onto the image object
			image[fieldname] = val;
			// set the mime type
			image.meta.mime = mimetype;
		}
	);

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

		const extension = mime.extension(image.meta.mime);

		debug(extension);

		// get the dimension meta
		if (imageFiletypes.includes(extension)) {
			// its a static image. get dims using the conventional way
			const dim = await getdim(image.path);
			image.meta.dimensions = { width: dim.width, height: dim.height };
		}
		if (mediaFiletypes.includes(extension)) {
			// its a webm or mp4. idk how to do these yet 😧
			image.meta.dimensions = { width: undefined, height: undefined };
		}

		// set the id
		image._id = UUID;

		image.save().then((document) => {
			debug("saved image to database");
			debug(document);
		});

		// respond all good ✅
		res.status(200).json({ success: true, data: image });
		res.end();
	});

	// Connects this read stream to busboy WriteStream to write the file and do other things
	// https://nodejs.org/docs/v0.4.8/api/streams.html#stream.pipe
	return req.pipe(busboy);
};

module.exports = postImage;
