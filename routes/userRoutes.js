const express = require("express");
const router = express.Router();
const createUser = require("../controllers/userControllers/createUser");
const login = require("../controllers/userControllers/login");
const authenticate = require("../middleware/authenticate");

const bodyParser = require("body-parser");

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(bodyParser.json());

// pass the body-parser middleware to this route to give it access to req.body.username/password
router.post("/createUser", [urlencodedParser, authenticate], createUser);

router.post("/login", urlencodedParser, login);

module.exports = router;
