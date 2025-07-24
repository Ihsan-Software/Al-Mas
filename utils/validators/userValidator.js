const bcrypt = require("bcrypt");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 2 , max: 50})
    .withMessage('User name must be between 2 and 50 characters'),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 12, max: 64 }) // secure range
    .withMessage('Password must be between 12 and 64 characters'),

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

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
  .optional()
  .isLength({ min: 2 , max: 50})
  .withMessage('User name must be between 2 and 50 characters'),

  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check('password')
    .optional()
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 12, max: 64 }) // secure range
    .withMessage('Password must be between 12 and 64 characters'),
  check("phone")
    .optional()
    .isLength({min:11, max: 15 }) 
    .withMessage('Phone number must be between 11 and 15 digits'),

  check("image").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];



exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 2 , max: 50})
    .withMessage('User name must be between 2 and 50 characters'),

  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("phone")
    .optional()
    .isLength({min:11, max: 15 }) 
    .withMessage('Phone number must be between 11 and 15 digits'),

    body("image")
    .optional(),

  validatorMiddleware,
];

exports.updateLoggedUserPasswordValidator = [
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 12, max: 64 })
    .withMessage('Password must be between 12 and 64 characters'),
  validatorMiddleware,
];