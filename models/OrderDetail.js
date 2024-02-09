const mongoose = require("mongoose");

const OrderDetailSchema = new mongoose.Schema({
	order: {
		type: mongoose.Schema.ObjectId,
		ref: "Order",
		required: true,
	},
	item: {
		type: mongoose.Schema.ObjectId,
		ref: "Item",
		required: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);
