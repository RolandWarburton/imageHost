// const jest = require("jest");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv");

const queryUser = require("queryUser");
const db = require("../../database");

beforeAll(() => {
	require(path.resolve(process.env.ROOT, "database", "index.js"));
});

afterAll(() => {
	mongoose.disconnect();
});

describe("#getUser() using Promises", () => {
	test("user exists", () => {
		const user = queryUser("username", "user_notauser")
			.then((err, user) => {
				expect(user).toBeDefined();
			})
			.catch((err) => {});
	});

	test("returned user has all their fields", () => {
		const user = queryUser("username", "user_notauser")
			.then((err, user) => {
				expect(user.username).toBeDefined();
				expect(user.password).toBeDefined();
				expect(user._id).toBeDefined();
			})
			.catch((err) => {});
	});

	test("not found user returns error", () => {
		const user = queryUser("username", "user_notauser")
			.then((err, user) => {
				expect(user).toBe(null);
			})
			.catch((err) => {
				expect(err).not.toBe(null);
			});
	});
});
