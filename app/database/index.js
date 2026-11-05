const mongoose = require("mongoose");
const ora = require("ora");
const chalk = require("chalk");
const debug = require("debug")("imageHost:database");
const isDocker = require("is-docker");
require("dotenv/config");

// keep Mongoose 6's strict query filtering explicit (silences the Mongoose 7 deprecation warning)
mongoose.set("strictQuery", true);

// the database connection object
const db = mongoose.connection;

// Create a dank loading effect
const spinner = ora("Connecting to MongoDB...\n");
spinner.spinner = {
	interval: 100,
	frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
};

/**
 * @example connect("mongodb://user:pass(at)ip:27017/db?authSource=auth")
 * @param {string} url - url to connect to
 */
const connectToDB = async (username, password, port, database, auth) => {
	const addr = isDocker() ? "mongo" : "localhost";
	const userAuth = username ? `${username}:${password}@` : "";
	const url = `mongodb://${userAuth}${addr}:${port}/${database}?authsource=${auth}`;

	spinner.start();

	return mongoose.connect(url);
};

/** Returns an promise that resolves to true or false after the database has closed
 *
 */
const disconnectFromDB = async () => {
	return new Promise((resolve, reject) => {
		db.close((err) => {
			if (err) reject(err);
			else resolve("🗄 disconnected from the database");
		});
	})
		.then((success) => {
			debug(success);
			return true;
		})
		.catch((err) => {
			console.log(chalk.red(err));
			return false;
		});
};

db.once("open", function () {
	debug("Connected to database successfully");
	spinner.succeed(" MongoDB database connection established successfully");
});

// throw an error if database conn fails
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = { db, connectToDB, disconnectFromDB };
