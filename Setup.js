const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config();
const { User } = require("./models/userModel");
const debug = require("debug")("imageHost:setup");
const mongoose = require("mongoose");
const chalk = require("chalk");
const queryUser = require("./dbQueries/queryUser");
// get the db
const { db, connectToDB, disconnectFromDB } = require("./database");

const setup = async () => {
	// connect to database 🗃
	await connectToDB(process.env.DB_CONNECTION);

	const username = process.env.ACCOUNT_MASTER_USERNAME;
	const password = process.env.ACCOUNT_MASTER_PASSWORD;

	const queriedUser = await queryUser("username", username);

	if (!queriedUser) {
		debug(`Creating AccountMaster account (${username})`);

		const newUser = new User({
			username: username,
			password: password,
			superUser: true,
		});

		await newUser
			.save()
			.then((user) => {
				debug(`Successfully created new master user: ${user.username}`);
			})
			.catch((err) => {
				console.log(chalk.red(err));
			});
	} else {
		debug(`Account already exists (${queriedUser.username})`);
	}

	// nothing more to do
	disconnectFromDB().then(() => {
		debug("Successfully closed the database connection.");
	});
};

module.exports = setup();
