const chalk = require("chalk");
require("dotenv");

const server = require("./server");
const { db, connectToDB } = require("./database");

const go = async () => {
	await connectToDB(process.env.DB_CONNECTION);
	await server.startServer();
	await server.stopServer();
	db.close();
	console.log("db has stopped");
};
go();
