const request = require('supertest');
const app = require('../src/app');

describe("Orders API endpoints", () => {
  let adminToken;
  let customerToken;
  let customerId;
  let productId;
  let orderId;

  beforeAll(async () => {
    // Create admin user
    const adminUser = {
      username: "orderadmin",
      email: "orderadmin@example.com",
      password: "Admin@1234",
      role: "ADMIN"
    };

    const adminSignup = await request(app).post('/auth/signup').send(adminUser);
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    // Create customer user
    const customerUser = {
      username: "ordercustomer",
      email: "ordercustomer@example.com",
      password: "Customer@1234",
      role: "CUSTOMER"
    };

    const customerSignup = await request(app).post('/auth/signup').send(customerUser);
    customerId = customerSignup.body.id;
    const customerLogin = await request(app)
      .post('/auth/login')
      .send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;

    // Create a product for testing orders
    const product = {
      name: "Order Test Product",
      description: "Product for order testing",
      price: 25.00,
      stock: 50
    };

    const productResponse = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(product);
    productId = productResponse.body.id;
  });

  describe("POST /orders", () => {
    it("Should create an order with valid items", async () => {
      const order = {
        items: [
          { productId: productId, quantity: 2 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(order)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('totalPrice', 50.00);
      expect(response.body.orderItems).toHaveLength(1);
      orderId = response.body.id;
    });

    it("Should deduct stock after order", async () => {
      const response = await request(app)
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.stock).toBe(48);
    });

    it("Should reject order with insufficient stock", async () => {
      const order = {
        items: [
          { productId: productId, quantity: 100 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(order)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toBeDefined();
    });

    it("Should reject order with non-existent product", async () => {
      const order = {
        items: [
          { productId: 99999, quantity: 1 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(order)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it("Should validate order items", async () => {
      const invalidOrder = {
        items: []
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it("Should require authentication", async () => {
      const order = {
        items: [
          { productId: productId, quantity: 1 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(order)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe("GET /orders/:id", () => {
    it("Should get order by ID for owner", async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', orderId);
      expect(response.body).toHaveProperty('orderItems');
    });

    it("Should get any order for admin", async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', orderId);
    });

    it("Should return 404 for non-existent order", async () => {
      const response = await request(app)
        .get('/orders/99999')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });
});
