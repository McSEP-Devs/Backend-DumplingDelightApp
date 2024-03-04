const Billing = require("../models/Billing");
const Order = require("../models/Order");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const User = require("../models/User");

//@desc        Get all billings
//@route	   GET /billings
//@route       GET /orders/:orderId/billings
//@access      Public
exports.getBillings = asyncHandler(async (req, res, next) => {
	if (req.params.billingId) {
		const billings = await Billing.find({ billing: req.params.billingId });

		return res.status(200).json({
			success: true,
			count: billings.length,
			data: billings,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//@desc        Get single billing
//@route       GET /billings/:id
//@access      Public
exports.getBilling = asyncHandler(async (req, res, next) => {
	const billing = await Billing.findById(req.params.id).populate("order");

	if (!billing) {
		return next(
			new ErrorResponse(`No billing with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: billing,
	});
});

//@desc        Add new billing
//@route       POST /orders/:orderId/billings
//@access      Private
exports.createBilling = asyncHandler(async (req, res, next) => {
	req.body.order = req.params.orderId;
	// Add user to req,body
	req.body.user = req.user.id;

	const order = await Order.findById(req.params.orderId);

	if (!order) {
		return next(
			new ErrorResponse(`No order with the id of ${req.params.orderId}`),
			404
		);
	}

	const billing = await Billing.create(req.body);

	res.status(200).json({
		success: true,
		data: billing,
	});
});

//@desc        Update billings
//@route       PUT /billings/:billingId
//@access      Private
exports.updateBilling = asyncHandler(async (req, res, next) => {
	let billing = await Billing.findById(req.params.id);

	if (!billing) {
		return next(
			new ErrorResponse(`Billing not found with id of ${req.params.id}`, 404)
		);
	}
	billing = await Billing.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: billing,
	});
});

//@desc        Delete order
//@route       DELETE /billings/:id
//@access      Private
exports.deleteBilling = asyncHandler(async (req, res, next) => {
	const billing = await Billing.findById(req.params.id);
	if (!billing) {
		return next(
			new ErrorResponse(`Billing not found with id of ${req.params.id}`, 404)
		);
	}
	billing.remove();
	res.status(200).json({ success: true, data: {} });
});

// @desc      Get users within a radius
// @route     GET /billings/radius/:zipcode/:distance
// @access    Private
exports.getUsersInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// Calc radius using radians
	// Divide dist by radius of Earth
	// Earth Radius = 3,963 mi / 6,378 km
	const radius = distance / 3963;

	const billings = await Billing.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		success: true,
		count: billings.length,
		data: billings,
	});
});
