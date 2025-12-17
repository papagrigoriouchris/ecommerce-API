const prisma = require('../src/lib/prisma');

beforeAll(async () => {
  // Clean database before all tests
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Disconnect prisma after all tests
  await prisma.$disconnect();
});
