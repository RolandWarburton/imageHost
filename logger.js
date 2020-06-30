const winston = require("winston");
const { combine, timestamp } = winston.format;
require("dotenv");

// * ===============================================================
// * CONFIGURATION
// * ===============================================================

// these are the different levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,
};

// this is the generic format that a winston log will be in
const genericFormat = combine(
	timestamp({
		format: "YYYY-MM-DD HH:mm:ss",
	}),
	winston.format.json()
);

// custom file locations that can be attached to the transports: [] of a logger
// a transport of level 4 will also log levels 3, 2, 1, 0
const transports = {
	console: new winston.transports.Console(),
	error: new winston.transports.File({
		filename: "logs/error.log",
		level: "error",
	}),
	warn: new winston.transports.File({
		filename: "logs/warn.log",
		level: "warn",
	}),
	info: new winston.transports.File({
		filename: "logs/info.log",
		level: "info",
	}),
	http: new winston.transports.File({
		filename: "logs/http.log",
		level: "http",
	}),
	verbose: new winston.transports.File({
		filename: "logs/verbose.log",
		level: "verbose",
	}),
};

// * ===============================================================
// * LOGGERS
// * ===============================================================

// general logger for up to verbose level (level 4)
const logger = winston.createLogger({
	format: genericFormat,
	levels: levels,
	transports: [
		transports.info,
		transports.info,
		transports.warn,
		transports.error,
	],
});

// http ONLY logger
const httpLogger = winston.createLogger({
	format: genericFormat,
	// format: combine(label({ label: "right meow!" }), timestamp(), genericFormat),
	transports: [transports.console, transports.http],
});

// * Print to console if not in development mode
// If we're not in production then log to the the console
if (process.env.NODE_ENV !== "production") {
	logger.add(transports.console);
}

// * ===============================================================
// * STREAMS
// * ===============================================================

// Route all the httpLogger.stream messages to the httpLogger
httpLogger.stream = {
	write: function (message, encoding) {
		httpLogger.http(message);
	},
};

module.exports = { logger, httpLogger };
