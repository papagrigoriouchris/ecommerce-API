const express = require("express");
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const asyncHandler = require("../utils/asyncHandler");
const { requireRoles } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createProductSchema, updateProductSchema } = require("../validators/schemas");

const router = express.Router();

// GET /products - public (but needs authentication)
router.get("/", asyncHandler(listProducts));

// GET /products/:id - public (but needs authentication)
router.get("/:id", asyncHandler(getProductById));

// POST /products - ADMIN only
router.post("/", requireRoles("ADMIN"), validate(createProductSchema), asyncHandler(createProduct));

// PATCH /products/:id - ADMIN only
router.patch("/:id", requireRoles("ADMIN"), validate(updateProductSchema), asyncHandler(updateProduct));

// DELETE /products/:id - ADMIN only
router.delete("/:id", requireRoles("ADMIN"), asyncHandler(deleteProduct));

module.exports = router;
