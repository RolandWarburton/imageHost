// const jest = require("jest");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv");

// import db queries
const queryUser = require("queryUser");
const queryImageMeta = require("queryImageMeta");

const db = require("../../database/testing");

beforeAll(() => {
	// connect to the db
	db;
});

afterAll(() => {
	// disconnect gracefully from the testing db to prevent a warning
	mongoose.disconnect();
});

describe("Check GET user queries on mongo", () => {
	test("returns a user by username", () => {
		return queryUser("username", "user_0").then((user) => {
			expect(user).toBeDefined();
		});
	});

	test("normal user has all their fields", () => {
		return queryUser("username", "user_0").then((user) => {
			expect(user.username).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user._id).toBeDefined();
			expect(user.superuser).not.toBeDefined();
		});
	});

	test("superuser user has all their fields", () => {
		return queryUser("username", "AccountMaster").then((user) => {
			expect(user.username).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user._id).toBeDefined();

			// mainly checking that the AccountMaster has the superUser field
			// the superUser field is currently optional at this stage
			// so will only be defined for the superuser
			expect(user.superUser).toBeDefined();
		});
	});
});

describe("Check GET image meta queries on mongo", () => {
	// ! GO GET AN ID FROM THE MONGO DATABASE FOR THIS TEST TO WORK
	// ! Remove '.skip' once you have a correct image ID
	test.skip("returns an image meta", () => {
		return queryImageMeta("0b372629-c182-5edf-a385-9aaa19252fbd").then(
			(user) => {
				expect(user).toBeDefined();
			}
		);
	});
});

// db.createUser({
// 	user: "roland",
// 	pwd: "rhinos",
// 	roles: [{role: "readWrite", db: "testing"}]
// })
