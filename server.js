const express = require("express");
const db = require("./database");
const imageRoutes = require("./routes/imageRoutes");
const userRoutes = require("./routes/userRoutes");
const chalk = require("chalk");
const version = require("./package").version;
const fs = require("fs");
const internalIp = require("internal-ip");
const morgan = require("morgan");
const { logger } = require("./logger");
const { httpLogger } = require("./logger");
const debug = require("debug")("imageHost:http"); // DEBUG=http npm run monitor

const createDir = (path) => {
	debug(`Creating directory ${path}`);
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

createDir("./uploads");
createDir("./logs");

const endpoints = [];

for (layer of imageRoutes.stack) {
	endpoints.push({
		route: layer.route.path,
		help: layer.helpDescription,
	});
}

const app = express();
const port = process.env.PORT || 2020;

// * database
// throw an error if database conn fails
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// * middleware
// direct morgan http logs to winston http logger
app.use(morgan("combined", { stream: httpLogger.stream }));

// * routes
// import image API routes
app.use("/", imageRoutes);

// import user API routes
app.use("/", userRoutes);

// fallback
app.get("*", (req, res) => {
	res.status(200).json({ success: true, version: version, help: endpoints });
});

app.listen(port, async () => {
	// get the internal IP
	const ip = internalIp.v4();
	console.log(
		`Server running on ${chalk.green(`http://${await ip}:${port}`)}`
	);
	logger.info("Server started");
});
