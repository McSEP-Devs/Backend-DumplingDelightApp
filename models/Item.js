const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Please add a title"],
			trim: true,
			maxlength: [50, "title can not be more than 50 character"],
		},
		description: {
			type: String,
			trim: true,
		},
		unitPrice: {
			type: Number,
			trim: true,
		},
		type: {
			type: String,
			enum: [
				"dumpling",
				"filling",
				"cooking",
				"sauce",
				"salad",
				"drink",
				"dessert",
				"combo",
			],
		},
		image: {
			type: String,
			default: "no-photo.jpg",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		order: {
			type: mongoose.Schema.ObjectId,
			ref: "Order",
			required: false,
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

// Reverse populate with virtuals
ItemSchema.virtual("orders", {
	ref: "Order",
	localField: "_id",
	foreignField: "item",
	justOne: false,
});

module.exports = mongoose.model("Item", ItemSchema);
