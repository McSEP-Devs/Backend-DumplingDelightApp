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
		email: "raj@gmail.com",
		password: "123456",
	},
};
const authenticatedUser = request.agent(server);

let itemId = null;

let item = {
	title: "Test item",
	description: "Test description",
	unitPrice: 10.99,
	type: "dumpling",
};

let orderId = null;
let token;
let order = {
	total: 20,
	quantity: 1,
	orderType: "pickup",
};

describe("Should check order end points", () => {
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

	describe("GET /orders", () => {
		it("Should get all the orders", (done) => {
			chai
				.request(server)
				.get("/orders")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});

		it("Should not get all the orders", (done) => {
			chai
				.request(server)
				.get("/order")
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("POST /items/:itemId/orders", () => {
		it("Should create an order", (done) => {
			chai
				.request(server)
				.post(`/items/602ca11a1a73ee0c87a2583e/orders`)
				.set({ Authorization: `Bearer ${token}` })
				.send(order)
				.end((err, res) => {
					orderId = res.body.data._id;
					orederId = res.body.data._id;
					res.should.have.status(200);
					res.body.data.should.be.a("object");
					done();
				});
		});
	});

	describe("GET /orders/:id", () => {
		it("Should get single order", (done) => {
			chai
				.request(server)
				.get(`/orders/${orderId}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.data.should.be.a("object");
					res.body.success.should.be.eq(true);
					done();
				});
		});
		it("Should throw error when trying to get non existing order", (done) => {
			const orderId2 = "603925fddfcbb32f928e6c8f";
			chai
				.request(server)
				.get(`/orders/${orderId2}`)
				.end((err, res) => {
					res.should.have.status(500);
					res.body.error.should.be.eq(`No order with the id of ${orderId2}`);
					done();
				});
		});
	});

	describe("PUT /items/:itemId/orders/:orderId", () => {
		it("Should update an order", (done) => {
			order = {
				...order,
				total: 40,
				quantity: 2,
				orderType: "pickup",
			};
			chai
				.request(server)
				.put(`/items/602ca11a1a73ee0c87a2583e/orders/${orderId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(order)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.quantity.should.be.eq(order.quantity);
					res.body.data.total.should.be.eq(order.total);
					done();
				});
		});

		it("Should throw error if trying to update non existing order", (done) => {
			const orderId = "603925fddfcbb32f928e6c8f";
			chai
				.request(server)
				.put(`/items/602ca11a1a73ee0c87a2583e/orders/${orderId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(order)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Order not found with id of ${orderId}`);
					done();
				});
		});
	});

	describe("DELETE /orders/:id", () => {
		// it("Should delete an order", (done) => {
		// 	chai
		// 		.request(server)
		// 		.delete(`/orders/${orderId}`)
		// 		.set({ Authorization: `Bearer ${token}` })
		// 		.end((err, res) => {
		// 			res.should.have.status(200);
		// 			res.body.success.should.be.eq(true);
		// 			done();
		// 		});
		// });
		it("Should throw error if trying to delete non existing order", (done) => {
			const orderId = "603925fddfcbb32f928e6c8f";
			chai
				.request(server)
				.delete(`/orders/${orderId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Order not found with id of ${orderId}`);
					done();
				});
		});
	});
});
