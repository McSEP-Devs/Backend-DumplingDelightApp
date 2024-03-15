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
			enum: ["submitted", "inProcess", "ready", "completed"],
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

// Call getCashback before remove
OrderSchema.pre("remove", function () {
	this.constructor.getCashback(this.user);
});

// OrderSchema.pre("save", async function (next) {
// 	// Check if quantity is modified or if it's a new order
// 	if (this.isModified("quantity") || this.isNew) {
// 		try {
// 			// Fetch the item associated with this order to get the unit price
// 			const item = await mongoose.model("Item").findById(this.item);
// 			if (!item) {
// 				throw new Error("Item not found");
// 			}
// 			console.log("calculating total");
// 			// Correctly calculate total and assign it to this.total
// 			this.total = this.quantity * item.unitPrice;
// 		} catch (err) {
// 			console.error(err);
// 			return next(err);
// 		}
// 	}

// 	next();
// });

module.exports = mongoose.model("Order", OrderSchema);
