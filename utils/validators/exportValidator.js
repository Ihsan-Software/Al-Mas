const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createExportValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),

  check('details')
    .notEmpty()
    .withMessage('Details are required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Details must be between 5 and 500 characters'),

  check('notes')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Notes can be up to 300 characters'),

  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  validatorMiddleware,
];


exports.getExportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Export ID'),
  validatorMiddleware,
];


exports.updateExportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Export ID'),

  check('title')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),

  check('details')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Details must be between 5 and 500 characters'),

  check('notes')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Notes can be up to 300 characters'),

  check('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  validatorMiddleware,
];


exports.deleteExportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Export ID'),
  validatorMiddleware,
];
