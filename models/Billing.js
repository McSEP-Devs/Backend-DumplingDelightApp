const mongoose = require("mongoose");

const BillingSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
		order: {
			type: mongoose.Schema.ObjectId,
			ref: "Order",
			required: true,
		},
		address: {
			type: String,
			required: [true, "Please add an address"],
		},

		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

module.exports = mongoose.model("Billing", BillingSchema);
