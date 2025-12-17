const express = require("express");
const { createOrder, getOrderById } = require("../controllers/orderController");
const asyncHandler = require("../utils/asyncHandler");
const { requireRoles } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../validators/schemas");

const router = express.Router();

// POST /orders - CUSTOMER and ADMIN can create orders
router.post("/", requireRoles("CUSTOMER", "ADMIN"), validate(createOrderSchema), asyncHandler(createOrder));

// GET /orders/:id - CUSTOMER and ADMIN can view orders (but only their own unless admin)
router.get("/:id", requireRoles("CUSTOMER", "ADMIN"), asyncHandler(getOrderById));

module.exports = router;
