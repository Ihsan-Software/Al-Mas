const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 2 , max: 50})
    .withMessage('User name must be between 2 and 50 characters'),

  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 8, max: 64 }) // secure range
    .withMessage('Password must be between 8 and 64 characters'),

  check("phone")
    .optional()
    .isLength({min:11, max: 15 }) 
    .withMessage('Phone number must be between 11 and 15 digits'),

  check("image")
    .notEmpty()
    .withMessage('image required'),
  check("role").optional(),
  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 8, max: 64 }) // secure range
    .withMessage('Password must be between 8 and 64 characters'),

  validatorMiddleware,
];