const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { logActivity } = require("../utils/logger");

async function listProducts(req, res) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json(products);
}

async function getProductById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Product id must be a number" });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
}

async function createProduct(req, res) {
  const { name, description, price, stock } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      stock: stock || 0
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await logActivity(`Product created (id=${product.id}, name=${product.name})`);

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Product id must be a number" });
  }

  const { name, description, price, stock } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (stock !== undefined) updateData.stock = stock;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(product);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    throw error;
  }
}

async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Product id must be a number" });
  }

  try {
    const deleted = await prisma.product.delete({
      where: { id }
    });

    await logActivity(`Product deleted (id=${deleted.id}, name=${deleted.name})`);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    throw error;
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
