const express = require("express");
const imageRoutes = require("../routes/imageRoutes");
const userRoutes = require("../routes/userRoutes");
const debug = require("debug")("imageHost:server");
const chalk = require("chalk");
const version = require("../package").version;
const fs = require("fs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const internalIp = require("internal-ip");
const morgan = require("morgan");
// const { logger } = require("./logger");
const { httpLogger } = require("../logger");

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
for (let layer of imageRoutes.stack) {
	endpoints.push({
		route: layer.route.path,
		help: layer.helpDescription,
	});
}

// start the server
const server = express();

server.use(cors());

server.use(cookieParser());

// create a http server using express to allow use of the .close method from http
const httpServer = require("http").createServer(server);

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
server.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		version: version,
		commands: endpoints,
	});
});

// ===================== CONTROLLING THE SERVER =====================

/** Start the server
 * @example const server = require("./server")
 * server.start();
 */
const start = () => {
	debug("trying to start the express server...");

	// return a promise that resolves to true or false depending if the server started successfully
	return new Promise((resolve, reject) => {
		if (httpServer.listen(port)) {
			resolve(true);
		} else {
			reject(false);
		}
	})
		.then(() => {
			debug("connected to the express server!");
			return true;
		})
		.catch((err) => {
			console.log(chalk.red(err));
			return false;
		});
};

/** Stop the server
 * @example
 * const server = require("./server");
 * server.app.stop()
 */
const stop = () => {
	debug("trying to stop the express");

	return new Promise((resolve, reject) => {
		const success = httpServer.close((err) => {
			if (err) return false;
			else return true;
		});

		if (success) resolve(true);
		else reject(false);
	})
		.then(() => {
			debug("stopped the server successfully!");
		})
		.catch((err) => {
			console.log(chalk.red(err));
		});
};

module.exports = { app: server, startServer: start, stopServer: stop };
