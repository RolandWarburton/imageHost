// const jest = require("jest");
// const path = require("path");
// const mongoose = require("mongoose");
const fetch = require("node-fetch");
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const request = require("supertest");
require("dotenv");

// import db queries
// const queryUser = require("queryUser");
// const queryImageMeta = require("queryImageMeta");

const db = require("../../database");
const server = require("../../server");

// server.start();
// server.start();
// start();

// beforeEach(() => {
// 	start();
// });

// afterEach(() => {
// 	stop();
// });

beforeAll(async () => {
	await db.connectToDB(process.env.DB_CONNECTION_TESTING);
	await server.startServer();
});

afterAll(async () => {
	const quiet = true;
	await server.stopServer(quiet);
	await db.disconnectFromDB(true);
});

beforeEach(async () => {
	// do some stuff
});

describe("Check API login endpoint", () => {
	// const user = { username: "user_0", password: "password_0" };

	test("expect the user returned to be 200 OK", async () => {
		const res = await request(server.app).post("/login").send({
			username: "user0",
			password: "password0",
		});
		console.log(res.body);
		expect(res.statusCode).toEqual(200);
	});

	test("expect the user returns the auth-token", async () => {
		const res = await request(server.app).post("/login").send({
			username: "user0",
			password: "password0",
		});
		expect(res.body["auth-token"]).toBeDefined();
	});

	test.skip("check the auth token is correct");
	// test("login returns key", async () => {
	// 	const res = await request(server.app).post
	// })
});
