const request = require('supertest');
const app = require('../src/app');

describe("Auth API endpoints", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "Test@1234"
  };

  it("Should create a new user via POST /auth/signup", async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username', testUser.username);
    expect(response.body).toHaveProperty('email', testUser.email);
    expect(response.body).toHaveProperty('role', 'CUSTOMER');
  });

  it("Should return error for duplicate email", async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send(testUser)
      .expect(409);

    expect(response.body).toHaveProperty('error');
  });

  it("Should return validation error for weak password", async () => {
    const weakUser = {
      username: "weakuser",
      email: "weak@example.com",
      password: "123456"
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(weakUser)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  it("Should login and receive JWT token via POST /auth/login", async () => {
    const credentials = {
      email: testUser.email,
      password: testUser.password
    };

    const response = await request(app)
      .post('/auth/login')
      .send(credentials)
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('message', 'Login successful');
  });

  it("Should return error for invalid credentials", async () => {
    const invalidCredentials = {
      email: testUser.email,
      password: "WrongPassword123!"
    };

    const response = await request(app)
      .post('/auth/login')
      .send(invalidCredentials)
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});
