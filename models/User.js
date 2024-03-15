const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please add a valid email",
		],
	},
	phone: {
		type: String,
		required: [true, "Please add a phone number"],
		maxlength: [10, "Phone number can not be longer than 10 digits"],
	},
	address: {
		streetNumber: { type: Number },
		streetName: { type: String },
		apartmentNumber: { type: Number },
		city: { type: String },
		province: { type: String },
		postalCode: { type: String },
	},
	role: {
		type: String,
		enum: ["customer", "admin"],
		default: "customer",
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		select: false, // this way will not return the password when we use API to get the user
	},
	cashBackAmount: {
		type: Number,
		default: 0.0,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10); // Generate salt
	this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
});

// Sign JWT which gets stored in local storage and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString("hex");

	// Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Set expire --> 10 minutes
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
