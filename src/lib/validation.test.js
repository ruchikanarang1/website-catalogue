import { describe, it, expect } from 'vitest';
import { validators, validateForm, validateField } from './validation';

describe('validators', () => {
  describe('email', () => {
    it('accepts valid email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.in')).toBe(true);
      expect(validators.email('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validators.email('invalid')).toBe('Invalid email format');
      expect(validators.email('test@')).toBe('Invalid email format');
      expect(validators.email('@example.com')).toBe('Invalid email format');
      expect(validators.email('test@domain')).toBe('Invalid email format');
      expect(validators.email('test @example.com')).toBe('Invalid email format');
    });

    it('accepts empty value as optional', () => {
      expect(validators.email('')).toBe(true);
      expect(validators.email(null)).toBe(true);
      expect(validators.email(undefined)).toBe(true);
    });
  });

  describe('phone', () => {
    it('accepts valid 10-digit phone numbers', () => {
      expect(validators.phone('9876543210')).toBe(true);
      expect(validators.phone('1234567890')).toBe(true);
    });

    it('accepts phone numbers with formatting', () => {
      expect(validators.phone('98765 43210')).toBe(true);
      expect(validators.phone('987-654-3210')).toBe(true);
      expect(validators.phone('(987) 654-3210')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validators.phone('123')).toBe('Phone number must be 10 digits');
      expect(validators.phone('12345678901')).toBe('Phone number must be 10 digits');
      expect(validators.phone('abcdefghij')).toBe('Phone number must be 10 digits');
    });

    it('rejects empty phone number', () => {
      expect(validators.phone('')).toBe('Phone number is required');
      expect(validators.phone(null)).toBe('Phone number is required');
      expect(validators.phone(undefined)).toBe('Phone number is required');
    });
  });

  describe('required', () => {
    it('accepts non-empty values', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required('a')).toBe(true);
      expect(validators.required('123')).toBe(true);
    });

    it('rejects empty values', () => {
      expect(validators.required('')).toBe('This field is required');
      expect(validators.required('   ')).toBe('This field is required');
      expect(validators.required(null)).toBe('This field is required');
      expect(validators.required(undefined)).toBe('This field is required');
    });
  });

  describe('quantity', () => {
    it('accepts positive integers', () => {
      expect(validators.quantity(1)).toBe(true);
      expect(validators.quantity(10)).toBe(true);
      expect(validators.quantity(999)).toBe(true);
      expect(validators.quantity('5')).toBe(true);
      expect(validators.quantity('100')).toBe(true);
    });

    it('rejects zero and negative numbers', () => {
      expect(validators.quantity(0)).toBe('Quantity must be greater than 0');
      expect(validators.quantity(-1)).toBe('Quantity must be greater than 0');
      expect(validators.quantity('-5')).toBe('Quantity must be greater than 0');
      expect(validators.quantity('0')).toBe('Quantity must be greater than 0');
    });

    it('rejects non-numeric values', () => {
      expect(validators.quantity('abc')).toBe('Quantity must be greater than 0');
      expect(validators.quantity('')).toBe('Quantity must be greater than 0');
      expect(validators.quantity(null)).toBe('Quantity must be greater than 0');
    });
  });

  describe('password', () => {
    it('accepts passwords with 8 or more characters', () => {
      expect(validators.password('12345678')).toBe(true);
      expect(validators.password('password123')).toBe(true);
      expect(validators.password('verylongpassword')).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      expect(validators.password('1234567')).toBe('Password must be at least 8 characters');
      expect(validators.password('short')).toBe('Password must be at least 8 characters');
      expect(validators.password('a')).toBe('Password must be at least 8 characters');
    });

    it('rejects empty password', () => {
      expect(validators.password('')).toBe('Password is required');
      expect(validators.password(null)).toBe('Password is required');
      expect(validators.password(undefined)).toBe('Password is required');
    });
  });
});

describe('validateForm', () => {
  it('returns null when all validations pass', () => {
    const data = {
      email: 'test@example.com',
      phone: '9876543210',
      name: 'John Doe'
    };
    const rules = {
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone],
      name: [validators.required]
    };

    const result = validateForm(data, rules);
    expect(result).toBeNull();
  });

  it('returns errors object when validations fail', () => {
    const data = {
      email: 'invalid-email',
      phone: '123',
      name: ''
    };
    const rules = {
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone],
      name: [validators.required]
    };

    const result = validateForm(data, rules);
    expect(result).toEqual({
      email: 'Invalid email format',
      phone: 'Phone number must be 10 digits',
      name: 'This field is required'
    });
  });

  it('stops at first error for each field', () => {
    const data = {
      email: ''
    };
    const rules = {
      email: [validators.required, validators.email]
    };

    const result = validateForm(data, rules);
    expect(result).toEqual({
      email: 'This field is required'
    });
  });

  it('validates multiple fields independently', () => {
    const data = {
      email: 'valid@example.com',
      phone: '123',
      quantity: 5
    };
    const rules = {
      email: [validators.email],
      phone: [validators.phone],
      quantity: [validators.quantity]
    };

    const result = validateForm(data, rules);
    expect(result).toEqual({
      phone: 'Phone number must be 10 digits'
    });
  });

  it('handles empty rules object', () => {
    const data = { email: 'test@example.com' };
    const rules = {};

    const result = validateForm(data, rules);
    expect(result).toBeNull();
  });

  it('validates order form with all fields', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      address: '123 Main St',
      quantity: 10
    };
    const rules = {
      name: [validators.required],
      email: [validators.email],
      phone: [validators.required, validators.phone],
      address: [validators.required],
      quantity: [validators.quantity]
    };

    const result = validateForm(data, rules);
    expect(result).toBeNull();
  });
});

describe('validateField', () => {
  it('returns null when all rules pass', () => {
    const result = validateField('test@example.com', [validators.required, validators.email]);
    expect(result).toBeNull();
  });

  it('returns first error message when validation fails', () => {
    const result = validateField('', [validators.required, validators.email]);
    expect(result).toBe('This field is required');
  });

  it('returns error from second rule if first passes', () => {
    const result = validateField('invalid', [validators.required, validators.email]);
    expect(result).toBe('Invalid email format');
  });

  it('handles single rule', () => {
    const result = validateField('9876543210', [validators.phone]);
    expect(result).toBeNull();
  });

  it('handles empty rules array', () => {
    const result = validateField('anything', []);
    expect(result).toBeNull();
  });
});
