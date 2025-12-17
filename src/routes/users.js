const express = require("express");
const { getUserById } = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();

// GET /users/:id - accessible by CUSTOMER and ADMIN
router.get("/:id", requireRoles("CUSTOMER", "ADMIN"), asyncHandler(getUserById));

module.exports = router;
