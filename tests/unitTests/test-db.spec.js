// const jest = require("jest");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv");

const queryUser = require("queryUser");
const db = require("../../database/testing");

beforeAll(() => {
	// connect to the db
	db;
});

afterAll(() => {
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

	// test("returned user has all their fields", () => {
	// 	db.once("open", () => {
	// 		return queryUser("username", "user_notauser")
	// 			.then((err, user) => {
	// 				expect(user.username).toBeDefined();
	// 				expect(user.password).toBeDefined();
	// 				expect(user._id).toBeDefined();
	// 				expect(user.superUser).toBeDefined();
	// 				// expect(user).toBe("peanut butter");
	// 			})
	// 			.catch((err) => {});
	// 	});
	// 	mongoose.disconnect();
	// });

	// test("not found user returns error", () => {
	// 	const user = queryUser("username", "user_notauser")
	// 		.then((err, user) => {
	// 			expect(user).toBe(null);
	// 		})
	// 		.catch((err) => {
	// 			expect(err).not.toBe(null);
	// 		});
	// });
});

// db.createUser({
// 	user: "roland",
// 	pwd: "rhinos",
// 	roles: [{role: "readWrite", db: "testing"}]
// })
