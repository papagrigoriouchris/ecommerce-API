const Joi = require('joi');

// User/Auth validation schemas
const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(8).max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      'any.required': 'Password is required'
    }),
  role: Joi.string().valid('CUSTOMER', 'ADMIN').default('CUSTOMER')
    .messages({
      'any.only': 'Role must be either CUSTOMER or ADMIN'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Product validation schemas
const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).required()
    .messages({
      'string.min': 'Product name is required',
      'string.max': 'Product name must be at most 255 characters',
      'any.required': 'Product name is required'
    }),
  description: Joi.string().max(1000).allow('', null)
    .messages({
      'string.max': 'Description must be at most 1000 characters'
    }),
  price: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
  stock: Joi.number().integer().min(0).default(0)
    .messages({
      'number.integer': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative'
    })
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(255)
    .messages({
      'string.min': 'Product name cannot be empty',
      'string.max': 'Product name must be at most 255 characters'
    }),
  description: Joi.string().max(1000).allow('', null)
    .messages({
      'string.max': 'Description must be at most 1000 characters'
    }),
  price: Joi.number().positive().precision(2)
    .messages({
      'number.positive': 'Price must be a positive number'
    }),
  stock: Joi.number().integer().min(0)
    .messages({
      'number.integer': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Order validation schemas
const orderItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required()
    .messages({
      'number.integer': 'Product ID must be an integer',
      'number.positive': 'Product ID must be a positive number',
      'any.required': 'Product ID is required'
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    })
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required()
    .messages({
      'array.min': 'Order must contain at least one item',
      'any.required': 'Order items are required'
    })
});

module.exports = {
  signupSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema
};
