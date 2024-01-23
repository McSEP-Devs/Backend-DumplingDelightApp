const express = require("express");
const path = require("path");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: "./config/config.env" });

const app = express();

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;

const server = app.listen(
	PORT,
	console.log(
		`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
			.bold
	)
);
