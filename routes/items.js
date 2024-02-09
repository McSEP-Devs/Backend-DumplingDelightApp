const express = require("express");
const {
	getItems,
	getItem,
	createItem,
	updateItem,
	deleteItem,
} = require("../controllers/items");

const Item = require("../models/Item");

// Include other resource routers
const orderRouter = require("./orders");

var router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");

// Protect and authorize middlewares
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:itemId/orders", orderRouter);

router
	.route("/")
	.get(advancedResults(Item, "orders"), getItems)
	.post(protect, authorize("admin"), createItem);

router
	.route("/:id")
	.get(getItem)
	.put(protect, authorize("admin"), updateItem)
	.delete(protect, authorize("admin"), deleteItem);

module.exports = router;
