const express = require("express");
const path = require("path");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const cors = require("cors");
const fileupload = require("express-fileupload");

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const billings = require("./routes/billings");
const auth = require("./routes/auth");
const users = require("./routes/users");
const items = require("./routes/items");
const orders = require("./routes/orders");

const app = express();

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
		return res.status(200).json({});
	}
	next();
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// @desc    Logs request to console
const logger = (req, res, next) => {
	console.log(
		`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
	);
	next();
};

app.use(logger);

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/billings", billings);
app.use("/auth", auth);
app.use("/users", users);
app.use("/items", items);
app.use("/orders", orders);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(
	PORT,
	console.log(
		`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
			.bold
	)
);
