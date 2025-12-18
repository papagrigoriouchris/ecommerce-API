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

  it("Should return error for duplicate username", async () => {
    const duplicateUsername = {
      username: "testuser",
      email: "different@example.com",
      password: "Test@1234"
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(duplicateUsername)
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

  it("Should return error for non-existent email", async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: "nonexistent@example.com", password: "Test@1234" })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});

describe("Users API endpoints", () => {
  let token;

  beforeAll(async () => {
    // Create and login user
    await request(app).post('/auth/signup').send({
      username: "userendpoint",
      email: "userendpoint@example.com",
      password: "Test@1234"
    });
    const login = await request(app).post('/auth/login').send({
      email: "userendpoint@example.com",
      password: "Test@1234"
    });
    token = login.body.token;
  });

  it("Should get user by ID", async () => {
    const signup = await request(app).post('/auth/signup').send({
      username: "getuser",
      email: "getuser@example.com",
      password: "Test@1234"
    });

    const response = await request(app)
      .get(`/users/${signup.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', signup.body.id);
    expect(response.body).toHaveProperty('email', 'getuser@example.com');
  });

  it("Should return 400 for invalid user ID", async () => {
    const response = await request(app)
      .get('/users/notanumber')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'User id must be a number');
  });

  it("Should return 404 for non-existent user", async () => {
    const response = await request(app)
      .get('/users/99999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it("Should require authentication", async () => {
    const response = await request(app)
      .get('/users/1')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});

describe("Auth middleware", () => {
  it("Should reject missing Bearer prefix", async () => {
    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'InvalidToken')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it("Should reject empty token", async () => {
    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'Bearer ')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it("Should reject invalid token", async () => {
    const response = await request(app)
      .get('/users/1')
      .set('Authorization', 'Bearer invalidtoken123')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});
