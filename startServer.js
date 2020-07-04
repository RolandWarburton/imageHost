require("dotenv");

const server = require("./server");

const { db, connectToDB } = require("./database");
connectToDB(process.env.DB_CONNECTION);

db.once("open", async () => {
	const ip = "localhost";
	const port = process.env.PORT || 2020;
	server.startServer(`server is now running on http://www.${ip}:${port}!`);
});
