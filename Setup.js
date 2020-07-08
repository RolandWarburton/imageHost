const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config();
const { User } = require("./models/userModel");
const debug = require("debug")("imageHost:setup");
const mongoose = require("mongoose");
const chalk = require("chalk");
const queryUser = require("./dbQueries/queryUser");

// get the server
const server = require("./server");

// get the db
const { db, connectToDB } = require("./database");
connectToDB(process.env.DB_CONNECTION);

db.once("open", async () => {
	const ip = "localhost";
	const port = process.env.PORT || 2020;
	await server.startServer(`server is now running on http://www.${ip}:${port}!`);

	const username = process.env.ACCOUNT_MASTER_USERNAME;
	const password = process.env.ACCOUNT_MASTER_PASSWORD;

	const queriedUser = await queryUser("username", username);

	if (queriedUser) {
		debug(`Account with the name ${username} already exists.`);
		return;

	} else {
		debug(`Creating AccountMaster (${username}) account...`);
		
		const newUser = new User({
			username: username,
			password: password,
			superUser: true,
		});

		// save the account into the database and close the connection
		await newUser.save().then(() => {
			mongoose.disconnect();
			return;
		});
	}

	// nothing more to do
	debug("no new user needed, closing the connection");
	mongoose.disconnect().then(() => {
		debug("Closed the database connection");
		return;
	});
	
});
