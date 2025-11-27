/**
 * Validation utilities using Yup
 * Common validation schemas for forms
 */

import * as yup from 'yup';

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // Email validation
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  // Password validation
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),

  // Confirm password validation
  confirmPassword: (passwordField = 'password') =>
    yup
      .string()
      .oneOf([yup.ref(passwordField), null], 'Passwords must match')
      .required('Please confirm your password'),

  // Phone number validation (Indian format - exactly 10 digits)
  phone: yup
    .string()
    .required('Phone number is required')
    .transform((value) => {
      // Remove spaces and other non-digit characters for validation
      return value ? value.replace(/\s/g, '') : value;
    })
    .matches(/^[6-9]\d{9}$/, 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9')
    .length(10, 'Phone number must be exactly 10 digits'),

  // Required string
  requiredString: (fieldName = 'This field') =>
    yup.string().required(`${fieldName} is required`),

  // Required number
  requiredNumber: (fieldName = 'This field') =>
    yup.number().required(`${fieldName} is required`).typeError(`${fieldName} must be a number`),

  // URL validation
  url: yup
    .string()
    .url('Invalid URL format')
    .required('URL is required'),

  // Date validation
  date: yup
    .date()
    .required('Date is required')
    .typeError('Invalid date format'),

  // Positive number
  positiveNumber: (fieldName = 'This field') =>
    yup
      .number()
      .positive(`${fieldName} must be a positive number`)
      .required(`${fieldName} is required`)
      .typeError(`${fieldName} must be a number`),
};

/**
 * Login form validation schema
 */
export const loginSchema = yup.object().shape({
  email: validationSchemas.email,
  password: yup.string().required('Password is required'),
});

/**
 * Register form validation schema
 */
export const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: validationSchemas.email,
  phone: validationSchemas.phone,
  password: validationSchemas.password,
  confirmPassword: validationSchemas.confirmPassword('password'),
});

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = yup.object().shape({
  name: yup.string().min(2, 'Name must be at least 2 characters'),
  email: validationSchemas.email,
  phone: validationSchemas.phone,
});

/**
 * Create custom validation schema
 * @param {object} fields - Field definitions
 * @returns {yup.ObjectSchema} - Yup schema
 */
export const createSchema = (fields) => {
  const shape = {};
  Object.keys(fields).forEach((key) => {
    shape[key] = fields[key];
  });
  return yup.object().shape(shape);
};

// Export yup for custom schemas
export { yup };
