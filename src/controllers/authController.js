const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function signup(req, res) {
  const { username, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return res.status(409).json({ error: 'User with that email already exists' });
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });

  if (existingUsername) {
    return res.status(409).json({ error: 'User with that username already exists' });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    console.error('Failed to hash password', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER'
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  res.status(201).json(user);
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
    if (err) {
      console.error('Failed to create token', err);
      return res.status(500).json({ error: 'Failed to create token' });
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
}

module.exports = {
  signup,
  login
};
