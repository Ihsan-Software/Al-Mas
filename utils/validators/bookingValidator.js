const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Car = require("../../models/carModel")
const Tenant = require("../../models/tenantModel")
exports.createBookingValidator = [
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

  check("bookingDate")
    .notEmpty()
    .withMessage("booking Date required"),
  
  check("hour")
    .notEmpty()
    .withMessage("hour required"),

  check("day")
    .notEmpty()
    .withMessage("day required"),
    
  check("totalPrice")
    .notEmpty()
    .withMessage("total Price required"),

  check("pricePaid")
    .notEmpty()
    .withMessage("price Paid required"),

  check("RemainingPrice")
    .notEmpty()
    .withMessage("Remaining Price required"),


  validatorMiddleware,
];

exports.getBookingValidator = [
  check("id").isMongoId().withMessage("Invalid Booking id format"),
  validatorMiddleware,
];

exports.updateBookingValidator = [
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

  check("bookingDate")
    .optional()
    .notEmpty()
    .withMessage("booking Date required"),
  
  check("hour")
    .optional()
    .notEmpty()
    .withMessage("hour required"),

  check("day")
    .optional()
    .notEmpty()
    .withMessage("day required"),
    
  check("totalPrice")
    .optional()
    .notEmpty()
    .withMessage("total Price required"),

  check("pricePaid")
    .optional()
    .notEmpty()
    .withMessage("price Paid required"),

  check("RemainingPrice")
    .optional()
    .notEmpty()
    .withMessage("Remaining Price required"),
    
  validatorMiddleware,
];
;

exports.deleteBookingValidator = [
  check("id").isMongoId().withMessage("Invalid Booking id format"),
  validatorMiddleware,
];


exports.getBookingUseNameValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Booking required"),

  validatorMiddleware,
];
