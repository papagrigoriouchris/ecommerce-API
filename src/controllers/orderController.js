const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { logActivity } = require("../utils/logger");

async function createOrder(req, res) {
  const { items } = req.body;
  const userId = req.user.sub;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Get all product IDs from items
  const productIds = items.map(item => item.productId);

  // Fetch all products in one query
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true
    }
  });

  // Create a map for easy lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Validate all products exist and have sufficient stock
  const errors = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      errors.push(`Product with ID ${item.productId} not found`);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
      continue;
    }

    totalPrice += product.price * item.quantity;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Order validation failed",
      details: errors
    });
  }

  // Use a transaction to create order and update stock atomically
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalPrice,
        orderItems: {
          create: items.map(item => {
            const product = productMap.get(item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price
            };
          })
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Deduct stock for each product
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return newOrder;
  });

  await logActivity(`Order created (id=${order.id}, userId=${userId}, totalPrice=${totalPrice})`);

  res.status(201).json({
    id: order.id,
    userId: order.userId,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    user: order.user,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product
    }))
  });
}

async function getOrderById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Order id must be a number" });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Check if user is the owner of the order or is an admin
  const currentUserId = req.user.sub;
  const currentUserRole = req.user.role;

  if (order.userId !== currentUserId && currentUserRole !== "ADMIN") {
    return res.status(403).json({ error: "You can only view your own orders" });
  }

  res.json({
    id: order.id,
    userId: order.userId,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product
    }))
  });
}

module.exports = {
  createOrder,
  getOrderById
};
