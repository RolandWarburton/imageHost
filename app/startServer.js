const chalk = require("chalk");
const express = require("express");
const path = require("path");
const fs = require("fs");
const debug = require("debug")("imageHost:server");

require("dotenv").config();

const server = require("./server");
const { connectToDB } = require("./database");

/** return a messages telling the user where
 * the server is running locally
 * @example console.log(await getMessage());
 */
const getMessage = async () => {
	const port = process.env.PORT;
	return chalk.green(
		`Server is running http://${process.env.DOMAIN}:${port}`
	);
};

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

/** Call me to run the server!
 * @example go()
 */
const go = async () => {
	debug("Connecting to db");

	createDir("./uploads");
	createDir("./logs");

	await require("./Setup.js");
	await connectToDB(
		process.env.DB_USERNAME,
		process.env.DB_PASSWORD,
		process.env.DB_PORT,
		process.env.DB_DATABASE,
		process.env.DB_AUTHENTICATION_DATABASE
	);
	debug("Connected to db");
	await server.startServer();
	debug("started server");
	console.log(await getMessage());

	console.log(process.env.ROOT);
	server.app.use(
		"/login",
		express.static(path.resolve(process.env.ROOT, "public"))
	);
};
go();

// ? To shut down
// await server.stopServer();
// db.disconnectFromDB();
// console.log("db has stopped");

// ? debug route
// server.app.use(
// 	"/static",
// 	express.static(path.resolve(process.env.ROOT, "public"))
// );
