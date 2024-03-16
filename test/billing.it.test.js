let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
var request = require("supertest");

// Assertion type
chai.should();

chai.use(chaiHttp);

const userCredentials = {
	adminUser: {
		email: "admin@gmail.com",
		password: "123456",
	},
	customerUser: {
		email: "rajh@gmail.com",
		password: "123456",
	},
};
const authenticatedUser = request.agent(server);
let token;

let orderId = null;
let order = {
	total: 20,
	quantity: 1,
	orderType: "pickup",
};

let billingId = null;
let billing = {
	address: "240 Bloor St East, Toronto",
};

describe("Should check billing end points", () => {
	before(function (done) {
		authenticatedUser
			.post("/auth/login")
			.set("Accept", "application/json")
			.set("Content-Type", "application/json")
			.send(userCredentials.adminUser)
			.end(function (err, res) {
				if (err) throw err;
				token = res.body.token;
				done();
			});
	});

	describe("GET /orders/:orderId/billings", () => {
		it("Should get all the billings", (done) => {
			chai
				.request(server)
				.get("/orders/603923ad2e44732db5cd0a7e/billings")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});
		it("Should not get all the billings", (done) => {
			chai
				.request(server)
				.get("/billings")
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	describe("POST /orders/:orderId/billings", () => {
		before(function (done) {
			chai
				.request(server)
				.post(`/items/602ca11a1a73ee0c87a2583b/orders`)
				.set({ Authorization: `Bearer ${token}` })
				.send(order)
				.end((err, res) => {
					orderId = res.body.data._id;
					done();
				});
		});

		after(function (done) {
			chai
				.request(server)
				.delete(`/orders/${orderId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					done();
				});
		});
		it("Should create a billing", (done) => {
			chai
				.request(server)
				.post(`/orders/${orderId}/billings`)
				.set({ Authorization: `Bearer ${token}` })
				.send(billing)
				.end((err, res) => {
					billingId = res.body.data._id;
					res.should.have.status(200);
					res.body.data.should.be.a("object");
					done();
				});
		});

		it("Should not create an billing without address", (done) => {
			delete billing.address;
			chai
				.request(server)
				.post("/billing")
				.set({ Authorization: `Bearer ${token}` })
				.send(billing)
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("GET /billings/:id", () => {
		it("Should get single billing", (done) => {
			chai
				.request(server)
				.get(`/billings/${billingId}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.data.should.be.a("object");

					res.body.success.should.be.eq(true);
					done();
				});
		});

		it("Should throw error when trying to get non existing billing", (done) => {
			let billingId3 = "604d48eeb0473e72f2cb7373";

			chai
				.request(server)
				.get(`/billings/${billingId3}`)
				.end((err, res) => {
					res.should.have.status(500);
					res.body.error.should.be.eq(
						`No billing with the id of ${billingId3}`
					);
					done();
				});
		});
	});

	describe(" PUT /billings/:id", () => {
		it("Should update a billing", (done) => {
			billing = {
				...billing,
				address: "123 king st., Toronto",
			};
			chai
				.request(server)
				.put(`/billings/${billingId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(billing)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.address.should.be.eq(billing.address);
					// res.body.data.type.should.be.eq(billing.type);
					done();
				});
		});

		it("Should throw error if trying to update non existing billing", (done) => {
			const billingId = "5d725a037b292f5f8ceff703";
			chai
				.request(server)
				.put(`/billings/${billingId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(billing)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(
						`Billing not found with id of ${billingId}`
					);
					done();
				});
		});
	});

	describe("DELETE /billings/:id", () => {
		// it("Should delete a billing", (done) => {
		// 	chai
		// 		.request(server)
		// 		.delete(`/billings/${billingId}`)
		// 		.set({ Authorization: `Bearer ${token}` })
		// 		.end((err, res) => {
		// 			res.should.have.status(200);
		// 			res.body.success.should.be.eq(true);
		// 			done();
		// 		});
		// });
		it("Should throw error if trying to delete non existing billing", (done) => {
			const billingId2 = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.delete(`/billings/${billingId2}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(
						`Billing not found with id of ${billingId2}`
					);
					done();
				});
		});
	});

	// describe("GET /billings/radius/:zipcode/:distance", () => {
	// 	it("Should get user within a radius", (done) => {
	// 		chai
	// 			.request(server)
	// 			.get("/billings/radius/m4x1g5/0.5")
	// 			.end((err, res) => {
	// 				res.should.have.status(200);
	// 				res.body.success.should.be.eq(true);
	// 				done();
	// 			});
	// 	});
	// });
});
