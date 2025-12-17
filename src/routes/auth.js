const express = require('express');
const { signup, login } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.post('/login', validate(loginSchema), asyncHandler(login));

module.exports = router;
