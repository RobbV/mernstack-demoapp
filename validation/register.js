const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'It looks like you forgot to tell me your name!';
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email is required!';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'This is not a valid email address';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password is required!';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password =
      'Hey! this password must be at least 6 characters in lenght';
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 =
      'Oops! it looks like you forgot to confirm your password!';
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
