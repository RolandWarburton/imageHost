const fs = require("fs");
const path = require("path");
const debug = require("debug")("imageHost:setup");
const mongoose = require("mongoose");
const chalk = require("chalk");
const { Image } = require("./models/imageModel");
const { User } = require("./models/userModel");
const sizeOf = require("image-size");
const { connectToDB } = require("./database");
const { v5: uuidv5 } = require("uuid");
const FormData = require("form-data");
require("dotenv").config();

/** Return a promise that resolves to a user
 * @example addUser("roland", "rhinos", false)
 * @returns JSON object of new user details
 * @param {string} username - username of the user
 * @param {string} password - password of the user
 * @param {boolean} superuser - if this user can create new users or not
 */
const addUser = async (username, password, superuser = false) => {
	const newUser = new User({
		username: username,
		password: password,
		superuser: superuser,
	});

	return newUser
		.save()
		.then((user) => {
			console.log(chalk.green.bold(`Created new user: ${user.username}`));
			return user;
		})
		.catch((err) => {
			console.red.bold(err);
		});
};

/** Post an image to the imageHost.imageHost collection
 *
 * @param {path} filepath - filepath to a supported media file
 * @param {string} user_id - _id of any existing user
 */
const addImage = async (filepath, user_id) => {
	// create a new form for this submission
	const form = new FormData();
	// append a readstream to the file and append it to the form for posting
	form.append("file", fs.createReadStream(filepath));

	const image = new Image();

	image.path = filepath;
	image._id = uuidv5(Math.random().toString(), uuidv5.URL);

	image.tags = [];

	image.user_id = user_id;

	image.meta.uploadDate = new Date();
	image.meta.uploadMonth = new Date().getMonth();
	image.meta.uploadYear = new Date().getUTCFullYear();

	try {
		const dimensions = sizeOf(image.path);
		image.meta.dimensions = {
			width: dimensions.width,
			height: dimensions.height,
		};
	} catch (err) {
		// debug(err);
	}

	return image.save().then((document) => {
		debug(`saved ${document._id} to db`);
		return document;
	});
};

const setupTests = async () => {
	await connectToDB(
		process.env.DB_USERNAME,
		process.env.DB_PASSWORD,
		process.env.DB_PORT,
		"testing",
		"testing"
	);

	// delete everything in the test users collection 🔥
	await User.deleteMany({}, (err, result) => {
		if (err) debug(err);
		debug(`Deleting old users... 🔥\n${JSON.stringify(result)}`);
	});

	// delete everything in the image collection 🔥
	Image.deleteMany({}, (err, result) => {
		if (err) debug(err);
		debug(`Deleting old images... 🔥\n${JSON.stringify(result)}`);
	});

	// Create some test data
	const users = [];
	for (let i of Array(5).keys()) {
		const username = "user_" + i;
		const password = "password_" + i;
		const superuser = false;
		users.push(addUser(username, password, superuser));
	}
	await Promise.all(users);

	// create an account admin and sign a key for them to use for post requests
	await addUser("AccountMaster", "rhinos", true);

	// get filepaths for different filetypes to post
	const png = path.resolve(__dirname, "testAssets", "png.png");
	const webm = path.resolve(__dirname, "testAssets", "webm.webm");
	const mp4 = path.resolve(__dirname, "testAssets", "mp4.mp4");

	// post images to imageHost.imageHost
	const images = [
		addImage(png, await users[0]._id),
		addImage(webm, await users[1]._id),
		addImage(mp4, await users[2]._id),
	];

	// make sure all posts resolve
	await Promise.all(images);

	console.log(chalk.magenta("STOPPING"));

	mongoose.disconnect();
};

module.exports = setupTests();
