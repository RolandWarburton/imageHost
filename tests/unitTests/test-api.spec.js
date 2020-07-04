// const jest = require("jest");
// const path = require("path");
// const mongoose = require("mongoose");
const fetch = require("node-fetch");
const chalk = require("chalk");
const request = require("supertest");
require("dotenv");

// import db queries
// const queryUser = require("queryUser");
// const queryImageMeta = require("queryImageMeta");

// import and start the server
const server = require("../../server/testing");
// server.start();
// server.start();
// start();

// beforeEach(() => {
// 	start();
// });

// afterEach(() => {
// 	stop();
// });

beforeAll(() => {
	// do stuff
	// start();
});

afterAll(() => {
	// disconnect gracefully from the testing db to prevent a warning
	// mongoose.disconnect();
	// stop the server to prevent the same warning
	// server.stop();
});

describe("Check API login endpoint", () => {
	// const user = { username: "user_0", password: "password_0" };

	test.skip("returns a user by username", async () => {
		// const res = await request(start).post("/login").send({
		// 	username: "user0",
		// 	password: "password0",
		// });
		// console.log(res);
		// expect(res.statusCode).toEqual(201);
		// expect(res.body).toHaveProperty("post");
		// ===========
		// done();
		// const fetchURL = "http://127.0.0.1:2020/login";
		// const options = {
		// 	method: "get",
		// 	headers: {
		// 		"Content-Type": "application/x-www-form-urlencoded",
		// 	},
		// 	body: {
		// 		username: "user_0",
		// 		password: "password_0",
		// 	},
		// };
		// const body = {
		// 	username: "user_0",
		// 	password: "password_0",
		// };
		// const a = await fetch(fetchURL, {
		// 	method: "POST",
		// 	body: body,
		// });
		// console.log(a);
		// .then((res) => {
		// 	console.log(res);
		// 	expect(res.success).toEqual(true);
		// 	// done();
		// })
		// .catch((err) => {
		// 	console.log(chalk.red(err));
		// });
		// console.log(response);
		// expect(response.success).toBeDefined();
		// expect(1).toBeDefined();
		// .then((res) => res.json())
		// .then((json) => {
		// 	expect(json).toBeDefined();
		// });
	});
});
