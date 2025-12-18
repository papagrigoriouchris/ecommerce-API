const prisma = require('../src/lib/prisma');

// Silence console output during tests
beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Clean database before all tests
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Restore console
  console.log.mockRestore();
  console.error.mockRestore();

  // Disconnect prisma after all tests
  await prisma.$disconnect();
});
