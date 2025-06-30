const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Car = require("../../models/carModel")
const Tenant = require("../../models/tenantModel")
exports.createContractValidator = [
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

  check("dailyPrice")
    .notEmpty()
    .withMessage("daily Price required"),
  
  check("overtimeCost")
    .notEmpty()
    .withMessage("overtime Cost required"),

  check("pricePaid")
    .notEmpty()
    .withMessage("pricePaid required"),
    
  check("duration")
    .notEmpty()
    .withMessage("duration required"),

  check("timeUnit")
    .notEmpty()
    .withMessage("timeUnit required"),

  check("discount")
    .notEmpty()
    .withMessage("discount required"),

  check("printTime")
    .optional()
    .notEmpty()
    .withMessage("printTime required"),
    
  check("insuranceType")
    .notEmpty()
    .withMessage("insurance Type required"),

  check("governorate")
    .notEmpty()
    .withMessage("governorate required"),

  check("driverName")
    .optional()
    .notEmpty()
    .withMessage("driverName required"),

  check("cardNumber")
    .optional()
    .notEmpty()
    .withMessage("cardNumber required"),

  check("phone")
    .optional()
    .notEmpty()
    .withMessage("phone required")
    .isMobilePhone(["ar-IQ"])
    .withMessage("Invalid phone number only accepted Iraq Phone numbers"),

  check("address")
    .optional()
    .notEmpty()
    .withMessage("address required"),

  validatorMiddleware,
];

exports.getContractValidator = [
  check("id").isMongoId().withMessage("Invalid Contract id format"),
  validatorMiddleware,
];

exports.updateContractValidator = [
  check("tenant")
    .optional()
    .notEmpty()
    .withMessage("tenant id  required")
    .isMongoId()
    .withMessage('Invalid tenant ID formate'),

  check("car")
    .optional()
    .notEmpty()
    .withMessage("car id  required")
    .isMongoId()
    .withMessage('Invalid car ID formate'),

  check("dailyPrice")
    .optional()
    .notEmpty()
    .withMessage("daily Price required"),
  
  check("overtimeCost")
    .optional()
    .notEmpty()
    .withMessage("overtime Cost required"),

  check("pricePaid")
    .optional()
    .notEmpty()
    .withMessage("pricePaid required"),
    
  check("duration")
    .optional()
    .notEmpty()
    .withMessage("duration required"),

  check("timeUnit")
    .optional()
    .notEmpty()
    .withMessage("timeUnit required"),

  check("discount")
    .optional()
    .notEmpty()
    .withMessage("discount required"),

  check("printTime")
    .optional()
    .notEmpty()
    .withMessage("printTime required"),
    
  check("insuranceType")
    .optional()
    .notEmpty()
    .withMessage("insurance Type required"),

  check("governorate")
    .optional()
    .notEmpty()
    .withMessage("governorate required"),

  check("driverName")
    .optional()
    .notEmpty()
    .withMessage("driverName required"),

  check("cardNumber")
    .optional()
    .notEmpty()
    .withMessage("cardNumber required"),

  check("phone")
    .optional()
    .notEmpty()
    .withMessage("phone required")
    .isMobilePhone(["ar-IQ"])
    .withMessage("Invalid phone number only accepted Iraq Phone numbers"),

  check("address")
    .optional()
    .notEmpty()
    .withMessage("address required"),
  validatorMiddleware,
];
;

exports.deleteContractValidator = [
  check("id").isMongoId().withMessage("Invalid Contract id format"),
  validatorMiddleware,
];


exports.getContractUseNameValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Contract required"),

  validatorMiddleware,
];
