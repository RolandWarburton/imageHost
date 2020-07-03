const Image = require("../models/imageModel");
const fs = require("fs");
const debug = require("debug")("imageHost:controllers");
const path = require("path");
require("dotenv").config();

const imageFiletypes = ["gif", "ico", "bmp", "jpeg", "png", "svg"];
const mediaFiletypes = ["mp4", "webm"];

const getImageById = (req, res) => {
	debug("Running getImageById...");
	res.setHeader("accept-ranges", "bytes");

	Image.find({ _id: req.params.id }, "path")
		.cursor()
		.on("error", (err) => {
			debug("ERROR: deleteImageById had a general error");
			res.status(400).json({ success: false, error: err });
		})
		.on("data", (image) => {
			debug("found some data");
			// get extension name of image
			const extension = path.parse(image.path).ext.replace(".", "");

			debug(`Extension type: ${extension}`);

			if (
				!imageFiletypes.includes(extension) &&
				!mediaFiletypes.includes(extension)
			) {
				debug("unsupported filetype. not in the list of allowed files");
				return res.status(415).json({
					success: false,
					error: "Unsupported file type",
				});
			}

			if (imageFiletypes.includes(extension)) {
				debug("its an image");
				res.status(200).sendFile(image.path);
			}

			if (["webm", "mp4"].includes(extension)) {
				const stat = fs.statSync(image.path);
				const fileSize = stat.size;
				const range = req.headers.range;
				if (range) {
					const parts = range.replace(/bytes=/, "").split("-");
					const start = parseInt(parts[0], 10);
					const end = parts[1]
						? parseInt(parts[1], 10)
						: fileSize - 1;
					const chunksize = end - start + 1;
					const file = fs.createReadStream(image.path, {
						start,
						end,
					});
					const head = {
						"Content-Range": `bytes ${start}-${end}/${fileSize}`,
						"Accept-Ranges": "bytes",
						"Content-Length": chunksize,
						"Content-Type": "video/mp4",
					};
					res.writeHead(206, head);
					file.pipe(res);
				} else {
					const head = {
						"Content-Length": fileSize,
						"Content-Type": "video/mp4",
					};
					res.writeHead(200, head);
					fs.createReadStream(image.path).pipe(res);
				}
			}
		})
		.on("end", () => {
			// do nothing
		});
};

module.exports = getImageById;
