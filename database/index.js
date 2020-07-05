const mongoose = require("mongoose");
const ora = require("ora");
const util = require("util");
const debug = require("debug")("imageHost:database");
require("dotenv/config");

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
 * @param {boolean} quiet - print messages or not
 */
const connectToDB = async (url, quiet) => {
	const connectionSchema = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};
	spinner.start();

	const con = util.promisify(mongoose.connect);
	return con(url, connectionSchema);
};

db.once("open", function () {
	debug("Connected to database successfully");
	spinner.succeed(" MongoDB database connection established successfully");
});

// throw an error if database conn fails
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = { db, connectToDB };
