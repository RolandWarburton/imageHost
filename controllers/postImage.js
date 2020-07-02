const Image = require("../models/imageModel");
const path = require("path");
const Formidable = require("formidable");
const Busboy = require("busboy");
const { v5: uuidv5 } = require("uuid");
const mime = require("mime-types");
const sizeOf = require("image-size");
const fs = require("fs");
const util = require("util");
const Dicer = require("dicer");
const chalk = require("chalk");
var inspect = require("util").inspect;
const debug = require("debug")("imageHost:controllers");
const debugHeader = require("debug")("imageHost:headers");
const debugData = require("debug")("imageHost:data");

require("dotenv").config();

const imageFiletypes = ["gif", "ico", "bmp", "jpeg", "png", "svg"];
const mediaFiletypes = ["mp4", "webm"];

// const getFilepathDetails = (mimetype, uuid) => {
// 	// make a random filename
// 	const filehash = uuid;

// 	// get the extension
// 	const fileExtension = mime.extension(mimetype);

// 	// get the filepath including the file itself
// 	const saveFilepath = path.resolve(
// 		process.env.UPLOAD_DIRECTORY_LOCATION,
// 		filehash + "." + fileExtension
// 	);

// 	return {
// 		filehash: filehash,
// 		fileExtension: fileExtension,
// 		saveFilepath: saveFilepath,
// 	};
// };

// const getdim = util.promisify(sizeOf);

const RE_BOUNDARY = /^multipart\/.+?(?: boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;

const postImage = (req, res) => {
	// let counter = 0;
	let dataBuffers = [];
	const m = RE_BOUNDARY.exec(req.headers["content-type"]);
	const boundry = m[1] || m[2];
	const d = new Dicer({ boundary: boundry });
	let state = { parts: [] };
	debug(`the boundry is: \n${boundry}`);

	d.on("part", function (p) {
		console.log(chalk.magenta("New part!"));

		let part = {
			body: undefined,
			bodylen: 0,
			error: undefined,
			header: undefined,
		};

		p.on("header", function (header) {
			part.header = header;
			for (var h in header) {
				debugHeader(`H: k: ${inspect(h)} v: ${inspect(header[h])}`);
			}
		})
			.on("data", (data) => {
				// make a copy because we are using readSync which re-uses a buffer ...
				var copy = new Buffer.alloc(data.length);
				data.copy(copy);
				data = copy;
				if (!part.body) part.body = [data];
				else part.body.push(data);
				part.bodylen += data.length;
			})
			.on("end", () => {
				if (part.body) {
					part.body = Buffer.concat(part.body, part.bodylen);
				}
				state.parts.push(part);
				debug(state);
				debug("==================================");
			});

		// p.on("data", function (data) {
		// 	// debugData(`${inspect(data.toString())}`);
		// 	dataBuffers.push(data);
		// });

		// p.on("end", function () {
		// 	console.log(chalk.red("End of part\n"));
		// 	let body = Buffer.concat(dataBuffers);
		// 	debug(body);
		// });
	});

	d.on("finish", function () {
		console.log(chalk.gray("End of parts"));
		res.writeHead(200);
		res.end("Form submission successful!");
	});

	d.on("close", () => {
		console.log("dicer close");
	});

	// Connects/pipes this read stream to req
	// https://nodejs.org/docs/v0.4.8/api/streams.html#stream.pipe
	req.pipe(d);
};

// // define some errors
// const errors = {
// 	file_too_big: { http: 455, error: "file was too big" },
// 	no_file: { http: 400, error: "no file" },
// 	too_many_files: { http: 400, error: "too many files" },
// 	wrong_file_format: { http: 401, error: "wrong format" },
// 	general_fail: { http: 400, error: "general failure" },
// };

// // define a response object
// // the response object is changed when errors are encountered
// let response = { success: true, http: 200, error: "" };

// const image = new Image();
// // let postedImage = false;
// const UUID = uuidv5(Math.random().toString(), uuidv5.URL);

// // 1GB filesize limit
// const busboy = new Busboy({
// 	headers: req.headers,
// 	limits: {
// 		files: 1,
// 		fileSize: 1000 * 1024 * 1024,
// 	},
// });

// // * ============================== On File ==============================
// busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
// 	// get details about the file
// 	const { saveFilepath, fileExtension } = getFilepathDetails(
// 		mimetype,
// 		UUID
// 	);

// 	// create a writeStream
// 	const f = fs.createWriteStream(saveFilepath);
// 	file.pipe(f);

// 	// check its filetype
// 	if (
// 		!imageFiletypes.includes(fileExtension) &&
// 		!mediaFiletypes.includes(fileExtension)
// 	) {
// 		debug(errors.wrong_file_format.error);
// 		response.success = false;
// 		response.http = errors.wrong_file_format.http;
// 		response.error = errors.wrong_file_format.error;
// 	}

// 	// this will emit if the file exceeds the filesize
// 	file.on("limit", () => {
// 		debug(`response will be ${errors.file_too_big.http}`);
// 		response.success = false;
// 		response.http = errors.file_too_big.http;
// 		response.error = errors.file_too_big.error;
// 		fs.unlink(saveFilepath, () => {
// 			debug(`deleted ${path.parse(saveFilepath).name}`);
// 		});
// 	});

// 	image.path = saveFilepath;
// 	image.meta.mime = mimetype;

// 	f.on("finish", () => {
// 		if (response.success) {
// 			debug("saved image to filesystem");
// 		} else {
// 			debug("closed the file stream");
// 		}
// 	});
// });

// // * ============================== On Field ==============================
// busboy.on(
// 	"field",
// 	(
// 		fieldname,
// 		val,
// 		fieldnameTruncated,
// 		valTruncated,
// 		encoding,
// 		mimetype
// 	) => {
// 		// stick this field onto the image object
// 		image[fieldname] = val;
// 	}
// );

// // * ============================== On Finish ==============================
// busboy.on("finish", async () => {
// 	// return an error if something went wrong ❌
// 	if (!response.success) {
// 		return res
// 			.status(response.http)
// 			.json({ success: response.success, error: response.error });
// 	}

// 	// otherwise procees ✅
// 	// set meta
// 	image.meta.uploadDate = new Date();
// 	image.meta.uploadMonth = new Date().getMonth();
// 	image.meta.uploadYear = new Date().getUTCFullYear();

// 	const extension = mime.extension(image.meta.mime);

// 	// debug(extension);

// 	// get the dimension meta
// 	if (imageFiletypes.includes(extension)) {
// 		// its a static image. get dims using the conventional way
// 		const dim = await getdim(image.path);
// 		image.meta.dimensions = {
// 			width: dim.width,
// 			height: dim.height,
// 		};
// 	}

// 	if (mediaFiletypes.includes(extension)) {
// 		// its a webm or mp4. idk how to do these yet 😧
// 		image.meta.dimensions = { width: undefined, height: undefined };
// 	}

// 	// set the id
// 	image._id = UUID;

// 	image.save().then((document) => {
// 		debug("saved image object to database");
// 		return res
// 			.status(response.http)
// 			.json({ success: response.success, data: image });
// 	});
// });

// // Connects this read stream to busboy WriteStream to write the file and do other things
// // https://nodejs.org/docs/v0.4.8/api/streams.html#stream.pipe
// return req.pipe(busboy);

module.exports = postImage;
