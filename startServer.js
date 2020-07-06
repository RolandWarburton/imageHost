const chalk = require("chalk");
const internalIp = require("internal-ip");
require("dotenv");

const server = require("./server");
const { db, connectToDB, disconnectFromDB } = require("./database");

/** return a messages telling the user where
 * the server is running locally
 * @example console.log(await getMessage());
 */
const getMessage = async () => {
	const ip = await internalIp.v4();
	const port = process.env.PORT;
	return chalk.green(`Server is running http://${ip}:${port}`);
};

/** Call me to run the server!
 * @example go()
 */
const go = async () => {
	await connectToDB(process.env.DB_CONNECTION);
	await server.startServer();
	console.log(await getMessage());
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
