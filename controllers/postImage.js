const { Image } = require("../models/imageModel");
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

/** Constructs a file path based on the specified UUID 
 * and mimetype.
 * @param {*} mimetype - The extension type of the file.
 * @param {*} uuid - The file's unique ID.
 * @returns A new file path.
 */
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

/** The controller which posts an image.
 * @param {*} req - The request passed in from the routes.
 * @param {*} res - The response returned.
 */
const postImage = (req, res) => {
	debug("Running postImage...");

	// define some errors
	const errors = {
		file_too_big: { http: 455, error: "file was too big" },
		no_file: { http: 400, error: "no file" },
		too_many_files: { http: 400, error: "too many files" },
		wrong_file_format: { http: 401, error: "wrong format" },
		general_fail: { http: 400, error: "general failure" },
	};

	// define a response object
	// the response object is changed when errors are encountered
	let response = { success: true, http: 200, error: "" };

	const files = [];

	debug("creating new Image object");
	const image = new Image();
	// let postedImage = false;
	const UUID = uuidv5(Math.random().toString(), uuidv5.URL);

	// the content-type should be multipart/form-data
	debug("checking the content-type headers are exist");
	if (!req.headers["content-type"]) {
		response.success = false;
		response.http = errors.no_file.http;
		response.error = errors.no_file.error;

		return res
			.status(response.http)
			.json({ success: response.success, error: response.error });
	}
	// 1GB filesize limit
	const busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: 1,
			fileSize: 1000 * 1024 * 1024,
		},
	});
	debug("waiting");

	// * ============================== On File ==============================
	busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
		debug("pushing file");
		files.push(file);
		// get details about the file
		const { saveFilepath, fileExtension } = getFilepathDetails(
			mimetype,
			UUID
		);

		// create a writeStream
		const f = fs.createWriteStream(saveFilepath);
		file.pipe(f);

		// check its filetype
		if (
			!imageFiletypes.includes(fileExtension) &&
			!mediaFiletypes.includes(fileExtension)
		) {
			debug(errors.wrong_file_format.error);
			response.success = false;
			response.http = errors.wrong_file_format.http;
			response.error = errors.wrong_file_format.error;
		}

		// this will emit if the file exceeds the filesize
		file.on("limit", () => {
			debug(`response will be ${errors.file_too_big.http}`);
			response.success = false;
			response.http = errors.file_too_big.http;
			response.error = errors.file_too_big.error;
			fs.unlink(saveFilepath, () => {
				debug(`deleted ${path.parse(saveFilepath).name}`);
			});
		});

		image.path = saveFilepath;
		image.meta.mime = mimetype;

		f.on("finish", () => {
			debug("file finished saving...");
			// if file was saved
			if (response.success) {
				// try and read the filesize
				try {
					image.meta.size = fs.statSync(image.path).size;
				} catch (err) {
					debug("ERROR: Failed to get the file size");
				} finally {
					// finally debug the console that the image was saved
					debug("saved image to filesystem");
				}
			} else {
				debug("closed the file stream");
			}
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
			debug("pushing field");
			// stick this field onto the image object
			image[fieldname] = val;
		}
	);

	// * ============================== On Finish ==============================
	busboy.on("finish", async () => {
		// return an error if something went wrong ❌
		if (!response.success) {
			return res
				.status(response.http)
				.json({ success: response.success, error: response.error });
		}

		// otherwise procees ✅
		// set meta
		image.meta.uploadDate = new Date();
		image.meta.uploadMonth = new Date().getMonth();
		image.meta.uploadYear = new Date().getUTCFullYear();

		const extension = mime.extension(image.meta.mime);

		// get the dimension meta
		if (imageFiletypes.includes(extension)) {
			// its a static image. get dims using the conventional way
			try {
				const dim = await getdim(image.path);
				image.meta.dimensions = {
					width: dim.width,
					height: dim.height,
					pixels: dim.width * dim.height,
				};
			} catch (err) {
				debug(err);
			}
		}

		if (mediaFiletypes.includes(extension)) {
			// its a webm or mp4. idk how to do these yet 😧
			image.meta.dimensions = { width: undefined, height: undefined };
		}

		// set the id
		image._id = UUID;

		// set the user
		image.user_id = res.user._id;

		const encrypted = req.secure ? "https" : "http";
		const url = `${encrypted}://${req.headers.host}/image/${image._id}`;

		image.save().then((document) => {
			debug("saved image object to database");
			return res
				.status(response.http)
				.json({ success: response.success, data: image, url: url });
		});
	});

	// Connects this read stream to busboy WriteStream to write the file and do other things
	// https://nodejs.org/docs/v0.4.8/api/streams.html#stream.pipe
	return req.pipe(busboy);
};

module.exports = postImage;
