const mongoose = require("mongoose");
const ora = require("ora");
const debug = require("debug")("imageHost:database");
require("dotenv/config");

// login details for the testing user
const user = "roland";
const pass = "rhinos";
const db = "testing";
const auth = "testing";
const ip = "localhost";

// connection string for the testing database
const conn = `mongodb://${user}:${pass}@${ip}:27017/${db}?authSource=${auth}`;
debug(`connecting to ${conn}`);

// connect to the database
mongoose
	.connect(conn, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.catch((err) => {
		console.log(err);
	});

// Create a dank loading effect
const spinner = ora("Connecting to MongoDB...\n");
spinner.spinner = {
	interval: 100,
	frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
};
spinner.start();

const connection = mongoose.connection;

connection.once("open", function () {
	debug("Connected to database successfully");
	spinner.succeed(" MongoDB database connection established successfully");
});

module.exports = connection;
