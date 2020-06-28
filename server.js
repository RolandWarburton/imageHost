const express = require("express");
const db = require("./database");
const imageRoutes = require("./routes/imageRoutes");
const version = require("./package").version;
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const internalIp = require("internal-ip");
const morgan = require("morgan");

const createDir = (path) => {
	if (!fs.existsSync(path))
		fs.mkdir(path, (err) => {
			if (err) {
				console.error(err);
				return;
			} else {
				console.log(`Build directory: ${path}`);
			}
		});
};

createDir("./uploads");
createDir("./logs");

// get the internal IP
const ipv4 = (async () => {
	console.log(`Running on ${await internalIp.v4()}`);
})();

const endpoints = [];

for (layer of imageRoutes.stack) {
	endpoints.push({
		route: layer.route.path,
		help: layer.helpDescription,
	});
}

const app = express();
const port = 2020;

// create a write stream (in append mode) for morgan
const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logs", "access.log"),
	{ flag: "a" }
);

// * database
// throw an error if database conn fails
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// * middleware
// write "combined" morgan logs to access.log
app.use(morgan("combined", { stream: accessLogStream }));
// log only 4xx and 5xx responses to console
app.use(
	morgan("dev", {
		skip: function (req, res) {
			return res.statusCode < 400;
		},
	})
);

// import API routes
app.use("/", imageRoutes);

// fallback
app.get("*", (req, res) => {
	res.status(200).json({ success: true, version: version, help: endpoints });
});

app.listen(port, () => console.log(`Server running on ${port}`));
