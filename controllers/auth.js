const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc    Register user
// @route   POST auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
	// Sending data on the body
	const { name, email, address, password, phone, role, cashBackAmount } =
		req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		address,
		password,
		phone,
		role,
		cashBackAmount,
	});

	sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate Email and Password
	if (!email || !password) {
		return next(new ErrorResponse("Please provide an email and password", 400));
	}

	// Check for user
	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
	// take the cookie and set it to none
	res.cookie("token", "none", {
		// expires in 5 seconds
		expires: new Date(Date.now() + 5 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc    Get current logged in user
// @route   POST /auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};
