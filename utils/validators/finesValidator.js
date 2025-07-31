const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Car = require("../../models/carModel")
const Tenant = require("../../models/tenantModel")
exports.createFineValidator = [
  check("tenantID")
    .notEmpty()
    .withMessage("tenant id  required")
    .isMongoId()
    .withMessage('Invalid tenant ID formate')
    .custom((tenantId) =>
      Tenant.findById(tenantId).then((tenant) => {
        if (!tenant) {
          return Promise.reject(
            new Error(`No tenant for this id: ${tenantId}`)
          );
        }
      })
    ),

  check("carID")
    .notEmpty()
    .withMessage("car id  required")
    .isMongoId()
    .withMessage('Invalid car ID formate')
    .custom((carId) =>
      Car.findById(carId).then((car) => {
        if (!car) {
          return Promise.reject(
            new Error(`No tenant for this id: ${carId}`)
          );
        }
      })
    ),
  check("fineDate")
    .notEmpty()
    .withMessage("fine Date required"),
  
  check("finePlace")
    .notEmpty()
    .withMessage("fine Place required"),

  check("fineNumber")
    .notEmpty()
    .withMessage("fine Number required"),
    
  check("RemainingPrice")
    .notEmpty()
    .withMessage("Remaining Price required"),

  check("pricePaid")
    .notEmpty()
    .withMessage("price Paid required"),

  check("note")
    .optional(),

  validatorMiddleware,
];

exports.getFineValidator = [
  check("id").isMongoId().withMessage("Invalid Fine id format"),
  validatorMiddleware,
];

exports.updateFineValidator = [
  check("tenantID")
    .optional()
    .notEmpty()
    .withMessage("tenant id  required")
    .isMongoId()
    .withMessage('Invalid tenant ID formate'),

  check("carID")
    .optional()
    .notEmpty()
    .withMessage("car id  required")
    .isMongoId()
    .withMessage('Invalid car ID formate'),

  check("fineDate")
    .optional()
    .notEmpty()
    .withMessage("fine Date required"),
  
  check("finePlace")
    .optional()
    .notEmpty()
    .withMessage("fine Place required"),

  check("fineNumber")
    .optional()
    .notEmpty()
    .withMessage("fine Number required"),
    
  check("RemainingPrice")
    .optional()
    .notEmpty()
    .withMessage("Remaining Price required"),

  check("pricePaid")
    .optional()
    .notEmpty()
    .withMessage("price Paid required"),

  check("note")
    .optional(),
  
  validatorMiddleware,
];
;

exports.deleteFineValidator = [
  check("id").isMongoId().withMessage("Invalid Fine id format"),
  validatorMiddleware,
];


exports.getFineUseNameValidator = [
  check("name")
    .notEmpty()
    .withMessage("Fine required"),

  validatorMiddleware,
];
