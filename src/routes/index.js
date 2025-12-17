const express = require("express");
const authRoutes = require("./auth");
const userRoutes = require("./users");
const productRoutes = require("./products");
const orderRoutes = require("./orders");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", message: "E-commerce API is running" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
