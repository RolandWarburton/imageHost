const Image = require("../models/imageModel");
const fs = require("fs");
const debug = require("debug")("imageHost:controllers");
const path = require("path");
require("dotenv").config();

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

			// get extension name of image 
			const extension = path.extname(image.path).substring(1);

			debug(`Extension type: ${extension}`);

			switch(extension)
			{
				case 'gif':
				case 'png':
				case 'jpg':
				case 'jpeg':
					res.setHeader("content-type", "image/png");
					res.status(200).send(fs.readFileSync(image.path));
					return;

				case 'webm':
				case 'mp4':
					fs.stat(image.path, (error, stats) => {
						var headers;

						if(error){
							res.setHeader("content-type", "text/html");
							res.status(404).json({
								success: false,
								error: "An unexpected error occurred"
							});
						}
						var totalSize = stats.size;

						if(req.headers.range){
							const range = req.headers.range;

							const parts = range.replace(/bytes=/, "").split("-");
							var partStart = parts[0];
							var partEnd = parts[1];

							var start = parseInt(partStart, 10);
							var end = partEnd ? parseInt(partEnd, 10) : totalSize - 1;

							var chunkSize = (end - start) + 1;

							res.setHeader("content-type", "video/mp4");
							res.setHeader("content-range", "bytes " + start + "-" + end + "/" + totalSize);
							res.setHeader("content-length", chunkSize);
						} else{

							res.setHeader("content-type", "video/mp4");
							res.setHeader("content-range", "bytes " + start + "-" + end + "/" + totalSize);

							//res.writeHead(200, headers);
						}
					});



					var fileStream = fs.createReadStream(image.path);

					fileStream.pipe(res);

					fileStream.on('error', (error) => {
						res.status(500).json({
							success: false,
							error: "An unexpected error has occurred",
						});
					});
					return;

				case 'svg':
				default:
					res.setHeader("content-type", "text/html");
					res.status(415).json({
						success: false,
						error: "Unsupported file type",
					});
					return;
			}
		})
		.on("end", () => {});
};

module.exports = getImageById;
