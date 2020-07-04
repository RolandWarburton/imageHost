const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config();
const { User } = require("./models/userModel");
const debug = require("debug")("imageHost:setup");
const db = require("./database/production");
const mongoose = require("mongoose");
const chalk = require("chalk");
const queryUser = require("./dbQueries/queryUser");

// Tell the user if theres an issue with the connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// once connected try and find the AccountMaster account. If it doesnt exist create it
db.once("open", () => {
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
