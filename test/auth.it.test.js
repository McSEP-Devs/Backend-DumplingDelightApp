const User = require("../models/User");
let chai = require("chai");
let chaiHttp = require("chai-http");
let expect = chai.expect;
const axios = require("axios");
let server = require("../server");
let request = require("supertest");

// Assertion type
chai.should();

chai.use(chaiHttp);

// Mailtrap credentials
const mailtrapApiToken = "b2b4de254d20b56ba88e4d0792ebc000";
const mailtrapInboxId = "1055105";

const userCredentials = {
	email: "john@gmail.com",
	password: "123456",
};

const authenticatedUser = request.agent(server);
let token, resetToken, userId;
const user = {
	name: "rajshahu",
	email: "raj@gmail.com",
	phone: "1234567091",
	password: "123456",
	role: "admin",
};

describe("Should test auth endpoints", () => {
	before(function (done) {
		authenticatedUser
			.post("/auth/login")
			.set("Accept", "application/json")
			.set("Content-Type", "application/json")
			.send({ email: "raj@gmail.com", password: "123456" })
			.end(function (err, res) {
				if (err) throw err;
				token = res.body.token;
				res.should.have.status(200);
				expect(token).to.not.be.null;
				done();
			});
	});

	before(async () => {
		// Login as the user and obtain auth token
		const loginResponse = await chai
			.request(server)
			.post("/auth/login")
			.send({ email: "raj@gmail.com", password: "123456" });
		token = loginResponse.body.token;
		expect(token).to.not.be.null;
	});

	before(async () => {
		// Trigger the forgotPassword process for an existing user
		await chai
			.request(server)
			.post("/auth/forgotpassword")
			.send({ email: "raj@gmail.com" });

		// Directly retrieve the reset token from the database
		const user = await User.findOne({ email: "raj@gmail.com" });
		resetToken = user.resetPasswordToken; // Make sure this is how you access the token in your User model
	});

	it("should get currently logged in user via token", function (done) {
		chai
			.request(server)
			.get("/auth/me")
			.set({ Authorization: `Bearer ${token}` })
			.end((err, res) => {
				userId = res.body.data._id;
				res.should.have.status(200);
				res.body.should.be.a("object");
				res.body.data.email.should.be.eq(user.email);
				res.body.data.should.have.property("name");
				res.body.data.should.have.property("role");
				done();
			});
	});

	it("should not login with non-existing user", function (done) {
		chai
			.request(server)
			.post("/auth/login")
			.send({ email: "nonexistinguser@example.com", password: "somepassword" })
			.end((err, res) => {
				res.should.have.status(401);
				res.body.should.have.property("success").eq(false);
				res.body.should.have.property("error").eq("Invalid credentials");
				done();
			});
	});

	it("should register user", function (done) {
		chai
			.request(server)
			.post("/auth/register")
			.set({ Authorization: `Bearer ${token}` })
			.send(user)
			.end((err, res) => {
				done();
			});
	});

	it("should not register duplicate user", function (done) {
		chai
			.request(server)
			.post("/auth/register")
			.set({ Authorization: `Bearer ${token}` })
			.send(user)
			.end((err, res) => {
				res.should.have.status(400);
				// res.body.error.should.be.eq(`Duplicate field value entered`);
				done();
			});
	});

	it("should not update password with incorrect current password", function (done) {
		const newPasswordDetails = {
			currentPassword: "wrongpassword",
			newPassword: "newSecurePassword123",
		};

		chai
			.request(server)
			.put("/auth/updatepassword")
			.set({ Authorization: `Bearer ${token}` }) // make sure to have a valid token
			.send(newPasswordDetails)
			.end((err, res) => {
				res.should.have.status(401);
				res.body.should.have.property("success").eq(false);
				res.body.should.have.property("error").eq("Password is incorrect");
				done();
			});
	});

	it("should update password with correct current password", function (done) {
		const newPasswordDetails = {
			currentPassword: "123456",
			newPassword: "123456",
		};

		chai
			.request(server)
			.put("/auth/updatepassword")
			.set({ Authorization: `Bearer ${token}` }) // make sure to have a valid token
			.send(newPasswordDetails)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property("success").eq(true);
				done();
			});
	});

	// it("should reset password with valid token obtained from Mailtrap", async () => {
	// 	// Trigger the forgotPassword process which sends an email
	// 	await chai
	// 		.request(server)
	// 		.post("/auth/forgotpassword")
	// 		.send({ email: "raj@gmail.com" });

	// 	// Fetch the email from Mailtrap's API
	// 	const emailsResponse = await axios.get(
	// 		`https://mailtrap.io/api/v1/inboxes/${mailtrapInboxId}/messages`,
	// 		{
	// 			headers: { "Api-Token": `${mailtrapApiToken}` },
	// 		}
	// 	);
	// 	const messages = emailsResponse.data;

	// 	// Find the most recent reset email
	// 	// You may need to adjust the logic to identify the reset email based on subject or sender
	// 	const resetEmail = messages.find(
	// 		(message) => message.subject === "Your password reset token"
	// 	);

	// 	// Fetch the full email content for the reset email
	// 	const emailContentResponse = await axios.get(
	// 		`https://mailtrap.io/api/v1/inboxes/${mailtrapInboxId}/messages/${resetEmail.id}/body`,
	// 		{
	// 			headers: { "Api-Token": `Bearer ${mailtrapApiToken}` },
	// 		}
	// 	);
	// 	const emailContent = emailContentResponse.data;

	// 	// Extract the reset token from the email content
	// 	// regex pattern to match the format of token in the email content
	// 	const resetTokenPattern = /resetpassword\/(\S+)/;
	// 	const resetTokenMatch = emailContent.match(resetTokenPattern);
	// 	const resetToken = resetTokenMatch ? resetTokenMatch[1] : null;

	// 	// Now use the resetToken to perform the password reset
	// 	const newPassword = "newSecurePassword123";
	// 	const resetPasswordResponse = await chai
	// 		.request(server)
	// 		.put(`/auth/resetpassword/${resetToken}`)
	// 		.send({ password: newPassword });

	// 	expect(resetPasswordResponse).to.have.status(200);
	// 	expect(resetPasswordResponse.body).to.have.property("success").eq(true);
	// });

	it("should not reset password with invalid token", function (done) {
		const invalidToken = "someinvalidtoken";
		const newPasswordDetails = {
			password: "newSecurePassword123",
		};

		chai
			.request(server)
			.put(`/auth/resetpassword/${invalidToken}`)
			.send(newPasswordDetails)
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.have.property("success").eq(false);
				res.body.should.have.property("error").eq("Invalid token");
				done();
			});
	});

	it("should logout user", function (done) {
		chai
			.request(server)
			.get("/auth/logout")
			.end((err, res) => {
				res.should.have.status(200);
				res.body.success.should.be.eq(true);
				done();
			});
	});
});
