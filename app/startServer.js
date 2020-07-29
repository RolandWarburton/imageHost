const chalk = require("chalk");
const express = require("express");
const path = require("path");
const internalIp = require("internal-ip");
const queryUser = require("./dbQueries/queryUser");
const { User } = require("./models/userModel");
const debug = require("debug")("imageHost:server");

require("dotenv").config();

const server = require("./server");
const { connectToDB } = require("./database");

/** return a messages telling the user where
 * the server is running locally
 * @example console.log(await getMessage());
 */
const getMessage = async () => {
	const ip = await internalIp.v4();
	const port = process.env.PORT;
	return chalk.green(
		`Server is running http://${process.env.DOMAIN}:${port}`
	);
};

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

/** Call me to run the server!
 * @example go()
 */
const go = async () => {
	debug("Connecting to db");

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

	// if (!(await queryUser("username", "AccountMaster"))) {
	// 	debug("NO MASTER USER. Creating Account Master");
	// 	await addUser("AccountMaster", "rhinos", true);
	// }

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
