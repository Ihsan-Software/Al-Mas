const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCarValidator = [
  check("name")
    .notEmpty()
    .withMessage("Car name required"),
  
  check("carType")
    .notEmpty()
    .withMessage("Car type required"),

  check("color")
    .notEmpty()
    .withMessage("color required"),
    
  check("carModel")
    .notEmpty()
    .withMessage("Car Model required"),

  check("carNumber")
    .notEmpty()
    .withMessage("Car number required"),

  check("chassisNumber")
    .notEmpty()
    .withMessage("Chassis number required"),

  check("walkingCounter")
    .notEmpty()
    .withMessage("Walking counter required"),
    
  check("licenseNumber")
    .notEmpty()
    .withMessage("License number required"),

  check("image")
    .notEmpty()
    .withMessage("image required"),

  validatorMiddleware,
];

exports.getCarValidator = [
  check("id").isMongoId().withMessage("Invalid Car id format"),
  validatorMiddleware,
];

exports.updateCarValidator = [
check("name")
  .optional()
  .notEmpty()
  .withMessage("Car name required"),

check("carType")
  .optional()
  .notEmpty()
  .withMessage("Car type required"),

check("color")
  .optional()
  .notEmpty()
  .withMessage("Color required"),

check("carModel")
  .optional()
  .notEmpty()
  .withMessage("Car Model required"),

check("carNumber")
  .optional()
  .notEmpty()
  .withMessage("Car number required"),

check("chassisNumber")
  .optional()
  .notEmpty()
  .withMessage("Chassis number required"),

check("walkingCounter")
  .optional()
  .notEmpty()
  .withMessage("Walking counter required"),

check("licenseNumber")
  .optional()
  .notEmpty()
  .withMessage("License number required"),

check("image")
  .optional()
  .notEmpty()
  .withMessage("Image required"),
  
  validatorMiddleware,
];
;

exports.deleteCarValidator = [
  check("id").isMongoId().withMessage("Invalid Car id format"),
  validatorMiddleware,
];


exports.getCarUseNameValidator = [
  check("name")
    .notEmpty()
    .withMessage("Car required"),

  validatorMiddleware,
];
