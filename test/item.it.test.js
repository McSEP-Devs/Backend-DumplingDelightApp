let chai = require("chai");
let chaiHttp = require("chai-http");
let expect = chai.expect;
let server = require("../server");
var request = require("supertest");
var sinon = require("sinon");

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
let token;
let item = {
	title: "Test item",
	description: "Test description",
	unitPrice: 10.99,
	type: "dumpling",
	remainingQuantity: 200,
};

describe("Should check item end points", () => {
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

	describe("GET /items", () => {
		it("Should get all the items", (done) => {
			chai
				.request(server)
				.get("/items")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});

		it("Should select titles of all the items", (done) => {
			chai
				.request(server)
				.get("/items?select=title")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});

		it("Should sort items by title", (done) => {
			chai
				.request(server)
				.get("/items/?sort=title")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});

		it("Should get only 2 items in a page", (done) => {
			chai
				.request(server)
				.get("/items?page=2&limit=2")
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(2);
					done();
				});
		});

		it("Should not get all the items", (done) => {
			chai
				.request(server)
				.get("/item")
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("POST /items", () => {
		it("Should create an item", (done) => {
			chai
				.request(server)
				.post(`/items`)
				.set({ Authorization: `Bearer ${token}` })
				.send(item)
				.end((err, res) => {
					itemId = res.body.data._id;
					res.should.have.status(201);
					res.body.data.title.should.be.eq(item.title);
					res.body.data.should.be.a("object");
					res.body.data.should.have.property("image");
					done();
				});
		});

		it("Should not create an item without title", (done) => {
			delete item.title;
			chai
				.request(server)
				.post("/item")
				.set({ Authorization: `Bearer ${token}` })
				.send(item)
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("GET /item/:id", () => {
		it("Should get single item", (done) => {
			chai
				.request(server)
				.get(`/items/${itemId}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.data.should.be.a("object");
					res.body.data.should.have.property("image");
					res.body.success.should.be.eq(true);
					done();
				});
		});
		it("Should throw error when trying to get non existing item", (done) => {
			const itemId = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.get(`/items/${itemId}`)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Item not found with id of ${itemId}`);
					done();
				});
		});
		it("Should throw error when trying to get item with wrong id", (done) => {
			const itemId = "602ca11a1a73ee0c87a2583";
			chai
				.request(server)
				.get(`/items/${itemId}`)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Resource not found.`);
					done();
				});
		});
	});
	describe("PUT /items/:id/photo", () => {
		it("Should upload a photo of an item", (done) => {
			chai
				.request(server)
				.put(`/items/${itemId}/photo`)
				.set({ Authorization: `Bearer ${token}` })
				.attach("file", "./test/photo/dumpling.jpg")
				// .send(item)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.success.should.be.eq(true);
					done();
				});
		});

		it("Should throw error if trying to upload photo of item that does not exist", (done) => {
			const itemId = "5d725a037b292f5f8ceff704";

			chai
				.request(server)
				.put(`/items/${itemId}/photo`)
				.set({ Authorization: `Bearer ${token}` })
				.attach("file", "./test/photo/dumpling.jpg")
				// .send(item)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Item not found with id of ${itemId}`);
					done();
				});
		});

		it("Should throw error if trying to upload file that is not photo", (done) => {
			chai
				.request(server)
				.put(`/items/${itemId}/photo`)
				.set({ Authorization: `Bearer ${token}` })
				.attach("file", "./test/photo/not-photo.pdf")
				// .send(item)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.error.should.be.eq(`Please upload an image file`);
					done();
				});
		});
	});

	describe("PUT /items/:id", () => {
		it("Should update an item", (done) => {
			item = {
				...item,
				type: "dumpling",
				description: "Test Description update",
			};
			chai
				.request(server)
				.put(`/items/${itemId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(item)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.description.should.be.eq(item.description);
					res.body.data.type.should.be.eq(item.type);
					done();
				});
		});

		it("Should throw error if trying to update non existing item", (done) => {
			const itemId = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.put(`/items/${itemId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(item)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Item not found with id of ${itemId}`);
					done();
				});
		});
	});

	describe("DELETE /items/:id", () => {
		it("Should delete an item", (done) => {
			chai
				.request(server)
				.delete(`/items/${itemId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.success.should.be.eq(true);
					done();
				});
		});
		it("Should throw error if trying to delete non existing item", (done) => {
			const itemId = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.delete(`/items/${itemId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`Item not found with id of ${itemId}`);
					done();
				});
		});
	});
});
