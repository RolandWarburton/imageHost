const mongoose = require("mongoose");
const ora = require("ora");
const debug = require("debug")("imageHost:database");
require("dotenv/config");

// connect to the database
mongoose
	.connect(process.env.DB_CONNECTION, {
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
