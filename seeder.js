const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Item = require("./models/Item");
const User = require("./models/User");
const Order = require("./models/Order");
const Billing = require("./models/Billing");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const items = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/items.json`, "utf-8")
);

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const orders = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/orders.json`, "utf-8")
);

const billings = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/billings.json`, "utf-8")
);

// Import into DB
const importData = async () => {
	try {
		await Item.create(items);
		await User.create(users);
		await Order.create(orders);
		await Billing.create(billings);
		console.log("Data Imported...".green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

// Delete data
const deleteData = async () => {
	try {
		await Item.deleteMany();
		await User.deleteMany();
		await Order.deleteMany();
		await Billing.deleteMany();
		console.log("Data Destroyed...".red.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	deleteData();
}
