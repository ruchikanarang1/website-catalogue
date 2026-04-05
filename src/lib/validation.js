/**
 * Validation utilities for form inputs
 */

export const validators = {
  /**
   * Validates email format
   * @param {string} value - Email to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  email: (value) => {
    if (!value) return true; // Optional field
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) || 'Invalid email format';
  },

  /**
   * Validates phone number (10 digits)
   * @param {string} value - Phone number to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  phone: (value) => {
    if (!value) return 'Phone number is required';
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10 || 'Phone number must be 10 digits';
  },

  /**
   * Validates required field
   * @param {string} value - Value to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  required: (value) => {
    return (value && value.trim().length > 0) || 'This field is required';
  },

  /**
   * Validates quantity (must be positive integer)
   * @param {number|string} value - Quantity to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  quantity: (value) => {
    const num = parseInt(value, 10);
    return (num > 0) || 'Quantity must be greater than 0';
  },

  /**
   * Validates password (minimum 8 characters)
   * @param {string} value - Password to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  password: (value) => {
    if (!value) return 'Password is required';
    return value.length >= 8 || 'Password must be at least 8 characters';
  }
};

/**
 * Validates a form object against a set of rules
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules { fieldName: [validator1, validator2] }
 * @returns {Object|null} Object with field errors or null if valid
 * 
 * @example
 * const errors = validateForm(
 *   { email: 'test@example.com', phone: '1234567890' },
 *   { 
 *     email: [validators.required, validators.email],
 *     phone: [validators.required, validators.phone]
 *   }
 * );
 */
export function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const result = rule(data[field]);
      if (result !== true) {
        errors[field] = result;
        break; // Stop at first error for this field
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validates a single field
 * @param {string} value - Value to validate
 * @param {Array} rules - Array of validator functions
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return result;
    }
  }
  return null;
}
