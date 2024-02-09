const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
	{
		total: {
			type: Number,
		},
		quantity: {
			type: Number,
			trim: true,
			default: 1,
		},
		isPaidUsingCashBack: {
			type: Boolean,
			default: false,
		},
		isAccepted: {
			type: Boolean,
			default: false,
		},
		orderStatus: {
			type: String,
			enum: ["submitted", "in process", "ready", "on delivery", "delivered"],
			default: "submitted",
		},
		orderType: {
			type: String,
			enum: ["pickup", "delivery"],
			default: "pickup",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		item: {
			type: mongoose.Schema.ObjectId,
			ref: "Item",
			required: true,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

module.exports = mongoose.model("Order", OrderSchema);
