const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createImportValidator = [
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


exports.getImportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Import ID'),
  validatorMiddleware,
];


exports.updateImportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Import ID'),

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


exports.deleteImportValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Import ID'),
  validatorMiddleware,
];
