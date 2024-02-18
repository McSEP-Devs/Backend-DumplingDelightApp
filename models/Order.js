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

// Static method to get cashback
OrderSchema.statics.getCashback = async function (userId) {
	console.log("Calculating cashback ....");
	const obj = await this.aggregate([
		{ $match: { user: userId } },
		{
			$group: {
				_id: "$user",
				cashBackAmount: { $sum: { $divide: ["$total", 50] } },
			},
		},
	]);

	try {
		await this.model("User").findByIdAndUpdate(userId, {
			$set: { cashBackAmount: obj[0] ? obj[0].cashBackAmount.toFixed(2) : 0 },
		});
	} catch (err) {
		console.error(err);
	}
};

// Post-save hook to decrement item stock and recalculate cashback
OrderSchema.post("save", async function () {
	// Decrement the item's stock quantity
	try {
		await mongoose.model("Item").findByIdAndUpdate(this.item, {
			$inc: { remainingQuantity: -this.quantity },
		});

		// Recalculate cashback for the user
		this.constructor.getCashback(this.user);
	} catch (err) {
		console.error(err);
	}
});

// Ensure the model is defined once to avoid OverwriteModelError
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

module.exports = Order;
