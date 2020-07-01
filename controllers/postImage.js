const Image = require("../models/imageModel");
const path = require("path");
const Formidable = require("formidable");
const Busboy = require("busboy");
const { v5: uuidv5 } = require("uuid");
const mime = require("mime-types");
const sizeOf = require("image-size");
const fs = require("fs");
const debug = require("debug")("imageHost:controllers");

require("dotenv").config();

const filetypes = ["png", "jpg", "jpeg", "svg", "gif", "mp4", "webm"];

const getFilepathDetails = (mimetype) => {
	// make a random filename
	const filehash = uuidv5(Math.random().toString(), uuidv5.URL);

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

const postImage = async (req, res) => {
	debug("Running postImage...");

	const busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: 1,
		},
	});

	busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
		const { saveFilepath, fileExtension } = getFilepathDetails(mimetype);
		// if (fieldname != "image")
		if (filetypes.includes(fileExtension)) {
			file.pipe(fs.createWriteStream(saveFilepath));
		} else {
			res.status(401).json({ success: false, error: "u did a bad!" });
			res.end();
		}
	});

	busboy.on("finish", function () {
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
