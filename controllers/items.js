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
//@route       POST /items
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

//@desc        Update item
//@route       PUT /items/:id
//@access      Private
exports.updateItem = asyncHandler(async (req, res, next) => {
	const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!item) {
		return next(
			new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: item });
});

//@desc        Delete item
//@route       DELETE /items/:id
//@access      Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
	const item = await Item.findById(req.params.id);
	if (!item) {
		return next(
			new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
		);
	}
	item.remove();
	res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo of a pasta
// @route   PUT /items/:id/photo
// @access  Private
exports.itemPhotoUpload = asyncHandler(async (req, res, next) => {
	const item = await Item.findById(req.params.id);

	if (!item) {
		return next(
			new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is admin
	if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.params.id} is not authorized to update this item`,
				401
			)
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file`, 400));
	}

	const file = req.files.file;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith("image")) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		);
	}

	// Create custom filename
	file.name = `photo_${item._id}${path.parse(file.name).ext}`;

	// Move the file to upload path
	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Item.findByIdAndUpdate(req.params.id, { image: file.name });

		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});
