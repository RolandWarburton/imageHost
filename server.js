const express = require("express");
const db = require("./database");
const imageRoutes = require("./routes/imageRoutes");
const version = require("./package").version;
const morgan = require("morgan");

const app = express();
const port = 2020;

// throw an error if database conn fails
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// middleware
app.use(morgan("combined"));

// import API routes
app.use("/", imageRoutes);

// fallback
app.get("*", (req, res) => {
	res.status(200).json({ success: true, version: version });
});

app.listen(port, () => console.log(`Server running on ${port}`));
