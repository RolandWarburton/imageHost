const User = require("../../models/userModel");
const queryUser = require("../../dbQueries/queryUser");
const jwt = require("jsonwebtoken");
const debug = require("debug")("imageHost:controllers");
require("dotenv");

// TODO make this use async/await to make it c l e a n
const createUser = (req, res) => {
	debug("Creating a new user...");
	// get the new users details
	const username = req.body.username;
	const password = req.body.password;

	// get the AccountMasters details
	// const accountMasterUsername = req.body.accountMasterUsername;
	// const accountMasterPassword = req.body.accountMasterPassword;

	const user = req.user;
	if (!user) {
		return res.status(400).json({
			success: false,
			error:
				"missing an auth-token. Please add an auth-token to the header",
		});
	}
	// extract the auth-token from the header
	// const token = req.header("auth-token");

	// if (!token) {
	// 	debug("ERROR: Missing an auth token");
	// 	return res.status(400).json({
	// 		success: false,
	// 		error:
	// 			"missing an auth-token. Please add an auth-token to the header",
	// 	});
	// }

	// debug(`The token passed in was ${token.substring(0, 6)}`);

	// let verifiedUser;
	// // decrypt the token into a user
	// try {
	// 	verifiedUser = jwt.verify(token, process.env.USER_KEY);
	// } catch (err) {
	// 	debug(err);
	// 	return res.status(401).json({
	// 		success: false,
	// 		error: "The token is incorrect",
	// 	});
	// }

	debug(`user: ${JSON.stringify(user)}`);
	debug(`checking if ${user._id} is a super user`);

	queryUser("_id", user._id).then((user) => {
		// thrrow error if account is missing
		if (!user) {
			debug("ERROR: Missing account or possibly invalid token");
			return res.status(401).json({
				success: false,
				error: "This account is missing somehow?",
			});
		}

		// throw 401 if the auth-token provided is not a superUsers
		if (!user.superUser) {
			return res.status(401).json({
				success: false,
				error:
					"The auth-token provided to create a new user is not a superUser and so cannot be used to generate a new account",
			});
		}

		if (!username || !password) {
			return res.status(400).json({
				success: false,
				error: "missing username or password",
			});
		}

		const newUser = new User({ username: username, password: password });
		newUser.save().then((document) => {
			debug(`new user: "${newUser.username}" has been created`);
			return res.status(200).json({ success: true, data: document });
		});
	});

	// debug("getting the AccountMasters details");

	// queryUser("AccountMaster").then((accountMaster) => {
	// 	if (!accountMaster) {
	// 		return res.status(400).json({
	// 			success: false,
	// 			error: "AccountMaster does not exist",
	// 		});
	// 	}

	// 	AccountMasterUsername = accountMaster.username;
	// 	AccountMasterPassword = accountMaster.password;
	// });
};

module.exports = createUser;
