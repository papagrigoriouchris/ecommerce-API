/**
 * Unit tests for business logic
 * Testing price calculations, stock validation, and other core logic
 */

describe('Price Calculation Logic', () => {
  // Helper function that mirrors the order total calculation
  function calculateOrderTotal(items, productMap) {
    let total = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }

  it('should calculate total price for single item', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }]
    ]);
    const items = [{ productId: 1, quantity: 2 }];

    const total = calculateOrderTotal(items, products);

    expect(total).toBe(50.00);
  });

  it('should calculate total price for multiple items', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }],
      [2, { id: 2, name: 'Product B', price: 15.50, stock: 50 }],
      [3, { id: 3, name: 'Product C', price: 99.99, stock: 10 }]
    ]);
    const items = [
      { productId: 1, quantity: 2 },  // 50.00
      { productId: 2, quantity: 3 },  // 46.50
      { productId: 3, quantity: 1 }   // 99.99
    ];

    const total = calculateOrderTotal(items, products);

    expect(total).toBe(196.49);
  });

  it('should return 0 for empty order', () => {
    const products = new Map();
    const items = [];

    const total = calculateOrderTotal(items, products);

    expect(total).toBe(0);
  });

  it('should handle decimal prices correctly', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 10.99, stock: 100 }]
    ]);
    const items = [{ productId: 1, quantity: 3 }];

    const total = calculateOrderTotal(items, products);

    expect(total).toBeCloseTo(32.97, 2);
  });

  it('should ignore non-existent products in calculation', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }]
    ]);
    const items = [
      { productId: 1, quantity: 2 },
      { productId: 999, quantity: 5 }  // Non-existent
    ];

    const total = calculateOrderTotal(items, products);

    expect(total).toBe(50.00);
  });
});

describe('Stock Validation Logic', () => {
  // Helper function that mirrors stock validation
  function validateStock(items, productMap) {
    const errors = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        errors.push(`Product with ID ${item.productId} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    return errors;
  }

  it('should pass validation when stock is sufficient', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }]
    ]);
    const items = [{ productId: 1, quantity: 50 }];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation when stock is insufficient', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 10 }]
    ]);
    const items = [{ productId: 1, quantity: 20 }];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Insufficient stock');
    expect(errors[0]).toContain('Available: 10');
    expect(errors[0]).toContain('Requested: 20');
  });

  it('should fail validation for non-existent product', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }]
    ]);
    const items = [{ productId: 999, quantity: 1 }];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Product with ID 999 not found');
  });

  it('should return multiple errors for multiple issues', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 5 }],
      [2, { id: 2, name: 'Product B', price: 15.00, stock: 3 }]
    ]);
    const items = [
      { productId: 1, quantity: 10 },   // Insufficient
      { productId: 2, quantity: 5 },    // Insufficient
      { productId: 999, quantity: 1 }   // Not found
    ];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(3);
  });

  it('should pass when quantity equals stock (edge case)', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 10 }]
    ]);
    const items = [{ productId: 1, quantity: 10 }];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(0);
  });

  it('should fail when stock is zero', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 0 }]
    ]);
    const items = [{ productId: 1, quantity: 1 }];

    const errors = validateStock(items, products);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Insufficient stock');
  });
});

describe('Stock Deduction Logic', () => {
  // Helper function that mirrors stock deduction
  function deductStock(products, items) {
    const updatedProducts = new Map(products);

    for (const item of items) {
      const product = updatedProducts.get(item.productId);
      if (product) {
        updatedProducts.set(item.productId, {
          ...product,
          stock: product.stock - item.quantity
        });
      }
    }

    return updatedProducts;
  }

  it('should correctly deduct stock after order', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }]
    ]);
    const items = [{ productId: 1, quantity: 30 }];

    const updated = deductStock(products, items);

    expect(updated.get(1).stock).toBe(70);
  });

  it('should deduct stock for multiple items', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 100 }],
      [2, { id: 2, name: 'Product B', price: 15.00, stock: 50 }]
    ]);
    const items = [
      { productId: 1, quantity: 10 },
      { productId: 2, quantity: 5 }
    ];

    const updated = deductStock(products, items);

    expect(updated.get(1).stock).toBe(90);
    expect(updated.get(2).stock).toBe(45);
  });

  it('should result in zero stock when all purchased', () => {
    const products = new Map([
      [1, { id: 1, name: 'Product A', price: 25.00, stock: 10 }]
    ]);
    const items = [{ productId: 1, quantity: 10 }];

    const updated = deductStock(products, items);

    expect(updated.get(1).stock).toBe(0);
  });
});

describe('Password Validation Logic', () => {
  // Mirrors the Joi password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  function isValidPassword(password) {
    return passwordRegex.test(password);
  }

  it('should accept valid strong password', () => {
    expect(isValidPassword('Test@1234')).toBe(true);
    expect(isValidPassword('MyP@ssw0rd')).toBe(true);
    expect(isValidPassword('Str0ng@Pass')).toBe(true);
    expect(isValidPassword('Secure!9')).toBe(true); // 8 chars with all requirements
  });

  it('should reject password without uppercase', () => {
    expect(isValidPassword('test@1234')).toBe(false);
  });

  it('should reject password without lowercase', () => {
    expect(isValidPassword('TEST@1234')).toBe(false);
  });

  it('should reject password without number', () => {
    expect(isValidPassword('Test@abcd')).toBe(false);
  });

  it('should reject password without special character', () => {
    expect(isValidPassword('Test12345')).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    expect(isValidPassword('Te@1abc')).toBe(false);
  });
});

describe('Email Validation Logic', () => {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(email) {
    return emailRegex.test(email);
  }

  it('should accept valid email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });
});

describe('Role-Based Access Control Logic', () => {
  function hasAccess(userRole, allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  it('should allow ADMIN access to admin-only routes', () => {
    expect(hasAccess('ADMIN', ['ADMIN'])).toBe(true);
  });

  it('should deny CUSTOMER access to admin-only routes', () => {
    expect(hasAccess('CUSTOMER', ['ADMIN'])).toBe(false);
  });

  it('should allow both roles access to shared routes', () => {
    const allowedRoles = ['CUSTOMER', 'ADMIN'];
    expect(hasAccess('CUSTOMER', allowedRoles)).toBe(true);
    expect(hasAccess('ADMIN', allowedRoles)).toBe(true);
  });

  it('should deny unknown roles', () => {
    expect(hasAccess('UNKNOWN', ['CUSTOMER', 'ADMIN'])).toBe(false);
    expect(hasAccess(null, ['CUSTOMER', 'ADMIN'])).toBe(false);
    expect(hasAccess(undefined, ['CUSTOMER', 'ADMIN'])).toBe(false);
  });
});
