const chalk = require("chalk");
const express = require("express");
const path = require("path");
require("dotenv");

const server = require("./server");
const { db, connectToDB } = require("./database");

const go = async () => {
	await connectToDB(process.env.DB_CONNECTION);
	await server.startServer();
	// await server.stopServer();
	// db.close();
	// console.log("db has stopped");
	// server.app.use(express.static("./public"));

	// debug route
	server.app.use(
		"/static",
		express.static(path.resolve(process.env.ROOT, "public"))
	);
};
go();
