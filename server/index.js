const express = require("express");
const imageRoutes = require("../routes/imageRoutes");
const userRoutes = require("../routes/userRoutes");
const chalk = require("chalk");
const version = require("../package").version;
const fs = require("fs");
// const internalIp = require("internal-ip");
const morgan = require("morgan");
// const { logger } = require("./logger");
const { httpLogger } = require("../logger");
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

// populate endpoints [] with some helpful info
const endpoints = [];
for (layer of imageRoutes.stack) {
	endpoints.push({
		route: layer.route.path,
		help: layer.helpDescription,
	});
}

// start the server
const server = express();
const port = process.env.PORT || 2020;

// * middleware
// direct morgan http logs to winston http logger
server.use(morgan("combined", { stream: httpLogger.stream }));

// * routes
// import image API routes
server.use("/", imageRoutes);

// import user API routes
server.use("/", userRoutes);

// fallback
server.get("*", (req, res) => {
	res.status(200).json({ success: true, version: version, help: endpoints });
});

// ===================== CONTROLLING THE SERVER =====================

/** Start the server
 * @example const server = require("./server")
 * server.start();
 * @param {string} message - what do you want to say when the server starts?
 */
const start = (message) => {
	server.listen(port, () => {
		if (message) console.log(chalk.green(message));
	});
};

/** Stop the server
 * @example const server = require("./server");
 * server.app.stop()
 */
const stop = () => {
	server.close();
};

module.exports = { app: server, startServer: start, stopServer: stop };
