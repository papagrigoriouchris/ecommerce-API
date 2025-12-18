const request = require('supertest');
const app = require('../src/app');

describe("Products API endpoints", () => {
  let adminToken;
  let customerToken;
  let productId;

  beforeAll(async () => {
    // Create admin user
    const adminUser = {
      username: "productadmin",
      email: "productadmin@example.com",
      password: "Admin@1234",
      role: "ADMIN"
    };

    await request(app).post('/auth/signup').send(adminUser);
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    // Create customer user
    const customerUser = {
      username: "productcustomer",
      email: "productcustomer@example.com",
      password: "Customer@1234",
      role: "CUSTOMER"
    };

    await request(app).post('/auth/signup').send(customerUser);
    const customerLogin = await request(app)
      .post('/auth/login')
      .send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;
  });

  describe("POST /products (Admin only)", () => {
    it("Should create a product when admin", async () => {
      const product = {
        name: "Test Product",
        description: "A test product",
        price: 29.99,
        stock: 100
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(product)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', product.name);
      expect(response.body).toHaveProperty('price', product.price);
      expect(response.body).toHaveProperty('stock', product.stock);
      productId = response.body.id;
    });

    it("Should reject product creation for customer", async () => {
      const product = {
        name: "Forbidden Product",
        price: 19.99,
        stock: 50
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(product)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it("Should validate product data", async () => {
      const invalidProduct = {
        name: "",
        price: -10,
        stock: -5
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe("GET /products", () => {
    it("Should get all products when authenticated", async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("Should require authentication", async () => {
      const response = await request(app)
        .get('/products')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe("PATCH /products/:id (Admin only)", () => {
    it("Should update product when admin", async () => {
      const update = {
        price: 39.99,
        stock: 150
      };

      const response = await request(app)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(update)
        .expect(200);

      expect(response.body).toHaveProperty('price', update.price);
      expect(response.body).toHaveProperty('stock', update.stock);
    });

    it("Should reject update for customer", async () => {
      const response = await request(app)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 9.99 })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe("GET /products/:id", () => {
    it("Should get product by ID", async () => {
      // Create a product first
      const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "Get Test", price: 10.00, stock: 5 });

      const response = await request(app)
        .get(`/products/${createRes.body.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createRes.body.id);
      expect(response.body).toHaveProperty('name', 'Get Test');
    });

    it("Should return 400 for invalid product ID", async () => {
      const response = await request(app)
        .get('/products/notanumber')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Product id must be a number');
    });

    it("Should return 404 for non-existent product", async () => {
      const response = await request(app)
        .get('/products/99999')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe("PATCH /products/:id edge cases", () => {
    it("Should return 400 for invalid product ID", async () => {
      const response = await request(app)
        .patch('/products/notanumber')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 20.00 })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Product id must be a number');
    });

    it("Should return 404 for non-existent product", async () => {
      const response = await request(app)
        .patch('/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 20.00 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe("DELETE /products/:id (Admin only)", () => {
    it("Should reject delete for customer", async () => {
      const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it("Should return 400 for invalid product ID", async () => {
      const response = await request(app)
        .delete('/products/notanumber')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Product id must be a number');
    });

    it("Should return 404 for non-existent product", async () => {
      const response = await request(app)
        .delete('/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it("Should delete product when admin", async () => {
      const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product deleted successfully');
    });
  });
});
