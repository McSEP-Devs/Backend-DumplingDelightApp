const Item = require("../models/Item");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc        Get all item
//@route       GET /items
//@access      Public
exports.getItems = asyncHandler(async (req, res, next) => {
	const items = await Item.find();
	res.status(200).json(res.advancedResults);
});

//@desc        Get single item
//@route       GET /items/:id
//@access      Public
exports.getItem = asyncHandler(async (req, res, next) => {
	const item = await Item.findById(req.params.id);

	if (!item) {
		return next(
			new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: item });
});

//@desc        Add new item
//@route       POST /orders/:orderId/items
//@access      Private
exports.createItem = asyncHandler(async (req, res, next) => {
	// Add user to req,body
	req.body.user = req.user.id;

	const item = await Item.create(req.body);
	res.status(201).json({
		success: true,
		data: item,
	});
});
