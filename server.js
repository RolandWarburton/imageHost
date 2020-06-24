const express = require("express");
const db = require("./database");

const app = express();
const port = 2020;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.listen(port, () => console.log(`Server running on ${port}`));
