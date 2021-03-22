const {check} = require('express-validator')

exports.userSignupValidator = [
  check('name')
  .not()
  .isEmpty()
  .withMessage('Name is required'),
  check('email')
  .isEmail()
  .withMessage('Valid email please'),
  check('password')
  .isLength({Min: 6})
  .withMessage('Password must be 6 characters minimum'),
]

exports.userSigninValidator = [
  check('email')
  .isEmail()
  .withMessage('Valid email please'),
  check('password')
  .isLength({Min: 6})
  .withMessage('Password must be 6 characters minimum'),
]

exports.forgotPasswordValidator = [
  check('email')
  .not()
  .isEmpty()
  .isEmail()
  .withMessage('Valid email please'),
]

exports.resetPasswordValidator = [
  check('newPassword')
  .not()
  .isEmpty()
  .isLength({min: 6})
  .withMessage('Password of 6 characters min.'),
]

exports.searchTerm = [
  check()
  .not()
  .isEmpty()
  .withMessage('Search term is blank')
]