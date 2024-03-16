const express = require("express");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require("../controllers/users");

const User = require("../models/User");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router
	.route("/")
	.get(advancedResults(User), authorize("admin"), getUsers)
	.post(protect, authorize("admin"), createUser);

router
	.route("/:id")
	.get(getUser, authorize("admin"))
	.put(protect, authorize("admin", "customer"), updateUser)
	.delete(protect, authorize("admin"), deleteUser);

module.exports = router;
