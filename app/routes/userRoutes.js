const express = require("express");
const router = express.Router();
const createUser = require("../controllers/userControllers/createUser");
const login = require("../controllers/userControllers/login");
const authenticate = require("../middleware/authenticate");
const buildRouter = require("./buildRouter");
const bodyParser = require("body-parser");

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(bodyParser.json());

const routes = [
	{
		path: "/createUser",
		method: "post",
		// pass the body-parser middleware to this route to give it access to req.body.username/password
		middleware: [urlencodedParser, authenticate],
		handler: createUser,
		help: {
			description: "Create a user",
			method: this.method,
			formOptions: {
				username: "String",
				password: "String",
				superUser: "Boolean",
			},
			example: "/createUser",
		},
	},
	{
		path: "/login",
		method: "post",
		middleware: [urlencodedParser],
		handler: login,
		help: {
			description: "Log a user in",
			method: this.method,
			formOptions: {
				username: "String",
				password: "String",
			},
			example: "/login",
		},
	},
	{
		path: "/logout",
		method: "post",
		middleware: [urlencodedParser],
		handler: createUser,
		help: {
			description:
				"Log a user out. Clears their token from the session cookies",
			method: this.method,
			example: "/logout",
		},
	},
];

buildRouter(router, routes);

// show the help json when the users route is hit
// remove the middleware
router.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		commands: routes.filter((route) => {
			delete route.middleware;
			return route;
		}),
	});
});

// ! debug route to check the cookie
router.get("/cookies", (req, res) => {
	res.send(req.cookies);
});

// ! debug route to clear the cookies
router.get("/logout", (req, res) => {
	res.clearCookie("auth-token");
	res.clearCookie("user");
	res.send("user logout successfully");
});

module.exports = router;
