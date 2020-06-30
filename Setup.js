const fs = require("fs");
const dotenv = require("dotenv").config();

const createDir = (path) => {
	if (!fs.existsSync(path))
		fs.mkdir(path, (err) => {
			if (err) {
				console.error(err);
				return;
			} else {
				console.log(`Build directory: ${path}`);
			}
		});
};

if (process.env.NODE_ENV == "development") {
	createDir(process.env.DEVELOPMENT_UPLOAD_DIRECTORY_LOCATION);
}

if (process.env.NODE_ENV == "production") {
	createDir(process.env.PRODUCTION_UPLOAD_DIRECTORY_LOCATION);
}

console.log("Setup.js");
