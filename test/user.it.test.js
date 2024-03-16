let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
var request = require("supertest");

var sinon = require("sinon");
const { use } = require("../routes/auth");

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

let userId = null;
let token;
let user = {
	name: "Test",
	email: "testuser@gmail.com",
	password: "123456",
	phone: "5555555555",
};

describe("Should check user end points", () => {
	before(function (done) {
		sinon.stub(console, "log"); // disable console.log
		// sinon.stub(console, 'info')  // disable console.info
		// sinon.stub(console, 'warn')  // disable console.warn
		//sinon.stub(console, 'error')  // disable console.error

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

	describe("GET /users", () => {
		it("Should get all the users by admin", (done) => {
			chai
				.request(server)
				.get("/users")
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.data.should.be.a("array");
					res.body.should.be.a("object");
					res.body.data.length.should.be.eq(res.body.count);
					done();
				});
		});
		it("Should not get all the users", (done) => {
			chai
				.request(server)
				.get("/user")
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("POST /users", () => {
		it("Should create an user", (done) => {
			chai
				.request(server)
				.post("/users")
				.set({ Authorization: `Bearer ${token}` })
				.send(user)
				.end((err, res) => {
					userId = res.body.data._id;
					res.should.have.status(201);
					res.body.data.name.should.be.eq(user.name);
					res.body.data.should.be.a("object");
					res.body.data.should.have.property("role");
					done();
				});
		});

		it("Should not create an user without name", (done) => {
			delete user.name;
			chai
				.request(server)
				.post("/users")
				.set({ Authorization: `Bearer ${token}` })
				.send(user)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});

	describe("GET /users/:id", () => {
		it("Should get single user", (done) => {
			chai
				.request(server)
				.get(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.data.should.be.a("object");
					res.body.data.should.have.property("role");
					res.body.success.should.be.eq(true);
					done();
				});
		});
		it("Should throw error when trying to get non existing user", (done) => {
			const userId2 = "602ca11b1a73ee0c87a25877";
			chai
				.request(server)
				.get(`/users/${userId2}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`User not found with id of ${userId2}`);
					done();
				});
		});
	});

	describe("PUT /users/:id", () => {
		// it('Should update an user', (done) => {
		// 	user = {
		// 		name: 'Test User',
		// 	    email: 'test@user.com',
		// 	    role: 'customer'
		// 	};
		// 	chai
		// 		.request(server)
		// 		.put(`/users/${userId}`)
		// 		.set({ Authorization: `Bearer ${token}` })
		// 		.send(user)
		// 		.end((err, res) => {
		// 			res.should.have.status(200);
		// 			res.body.data.name.should.be.eq(user.name);
		// 			res.body.data.email.should.be.eq(user.email);
		// 			done();
		// 		});
		// });

		it("Should throw error if trying to update non existing user", (done) => {
			const userId = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.put(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(user)
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`User not found with id of ${userId}`);
					done();
				});
		});
	});

	describe("DELETE /users/:id", () => {
		it("Should delete an user", (done) => {
			chai
				.request(server)
				.delete(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.success.should.be.eq(true);
					done();
				});
		});
		it("Should throw error if trying to delete non existing user", (done) => {
			const userId = "5d725a037b292f5f8ceff704";
			chai
				.request(server)
				.delete(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(404);
					res.body.error.should.be.eq(`User not found with id of ${userId}`);
					done();
				});
		});
	});
});

describe("Should check customer user end points", () => {
	before(function (done) {
		authenticatedUser
			.post("/auth/login")
			.set("Accept", "application/json")
			.set("Content-Type", "application/json")
			.send(userCredentials.customerUser)
			.end(function (err, res) {
				if (err) throw err;
				token = res.body.token;
				done();
			});
	});

	describe("GET /users", () => {
		it("Should not get all the users by customer", (done) => {
			chai
				.request(server)
				.get("/users")
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(403);
					done();
				});
		});
	});

	describe("POST /users", () => {
		it("Should  not create a user by customer", (done) => {
			chai
				.request(server)
				.post("/users")
				.set({ Authorization: `Bearer ${token}` })
				.send(user)
				.end((err, res) => {
					res.should.have.status(403);
					res.body.error.should.be.eq(
						`User role customer is not authorized to access this route`
					);
					done();
				});
		});
	});

	describe("PUT /users/:id", () => {
		it("Should not update an user by customer", (done) => {
			chai
				.request(server)
				.put(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.send(user)
				.end((err, res) => {
					res.should.have.status(403);
					res.body.error.should.be.eq(
						`User role customer is not authorized to access this route`
					);
					done();
				});
		});
	});
	describe("PUT /users/:id", () => {
		it("Should not delete an user by customer", (done) => {
			chai
				.request(server)
				.delete(`/users/${userId}`)
				.set({ Authorization: `Bearer ${token}` })
				.end((err, res) => {
					res.should.have.status(403);
					res.body.error.should.be.eq(
						`User role customer is not authorized to access this route`
					);
					done();
				});
		});
	});
});
