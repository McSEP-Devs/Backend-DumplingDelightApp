const Order = require("../models/Order");
const Item = require("../models/Item");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc        Get all orders
//@route	   GET /orders
//@route       GET /items/:itemId/orders
//@access      Public
exports.getOrders = asyncHandler(async (req, res, next) => {
	if (req.params.itemId) {
		const orders = await Order.find({ item: req.params.itemId });

		return res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//@desc        Get single order
//@route       GET /orders/:id
//@access      Public
exports.getOrder = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate({
		path: "item",
		select: "title description unitPrice type",
	});

	if (!order) {
		return next(
			new ErrorResponse(`No order with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: order,
	});
});

//@desc        Add new order
//@route       POST /items/:itemId/orders
//@access      Private
exports.createOrder = asyncHandler(async (req, res, next) => {
	req.body.item = req.params.itemId;
	// Add user to req,body
	req.body.user = req.user.id;

	const item = await Item.findById(req.params.itemId);

	if (!item) {
		return next(
			new ErrorResponse(`No item with the id of ${req.params.itemId}`),
			404
		);
	}
	const unitPrice = item.unitPrice;
	const quantity = req.body.quantity;
	let orderReq = req.body;

	//   console.log("********",orderReq)

	orderReq.total = unitPrice * quantity;
	const order = await Order.create(orderReq);

	res.status(200).json({
		success: true,
		data: order,
	});
});

//@desc        Update order
//@route       PUT /items/:itemId/orders/:orderId
//@access      Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
	req.body.item = req.params.itemId;

	const item = await Item.findById(req.params.itemId);

	if (!item) {
		return next(
			new ErrorResponse(`No item with the id of ${req.params.itemId}`),
			404
		);
	}

	const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!order) {
		return next(
			new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: order });
});

//@desc        Delete order
//@route       DELETE /orders/:id
//@access      Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
		return next(
			new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
		);
	}
	order.deleteOne();
	res.status(200).json({ success: true, data: {} });
});
