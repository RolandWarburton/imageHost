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
	server.startServer(`server is now running on http://www.${ip}:${port}!`);

	queryUser("AccountMaster")
		.then((user) => {
			if (user) {
				debug("AccountMaster exists");
				return true;
			} else {
				debug("user does not exist");
				return false;
			}
		})
		.then((AccountMasterUserExists) => {
			if (!AccountMasterUserExists) {
				debug("creating AccountMaster account...");
				const accountMaster = new User({
					username: "AccountMaster",
					password: "rhinos",
					superUser: true,
				});

				// save the account into the database and close the connection
				accountMaster.save().then(() => {
					mongoose.disconnect();
				});
			} else {
				debug("no new user needed, closing the connection");
				mongoose.disconnect().then(() => {
					debug("Closed the database connection");
				});
			}
			return true;
		});
});
