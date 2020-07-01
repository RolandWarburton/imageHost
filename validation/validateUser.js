const Joi = require("@hapi/joi");

// Minimum eight characters, maximum of 30, at least one upper case English letter,
// one lower case English letter, one number and one special character
const strongPassword =
	"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,30}$";

// Minimum eight characters, maximum of 30, any combination of alphanumeric or numbers are allowed
const weakPassword = "^[a-zA-Z0-9]{3,30}$";

const userSchema = Joi.object({
	username: Joi.string().alphanum().min(1).max(30).required(),
	password: Joi.string()
		.pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
		.required(),
});

const validateUser = (username, password) => {
	const { value, error } = userSchema.validate({
		username: username,
		password: password,
	});

	// if no errors then the user is valid
	const isVaidUser = !error ? true : false;

	// return true/false, and any errors
	return { isVaidUser, error };
};

module.exports = { userSchema, validateUser };
