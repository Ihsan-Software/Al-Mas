const bcrypt = require("bcrypt");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Tenant = require("../../models/tenantModel");

exports.createTenantValidator = [
  check("name")
    .notEmpty()
    .withMessage("Tenant name required")
    .isLength({ min: 2 })
    .withMessage("Too short Tenant name"),
  
  check("houseLocation")
    .notEmpty()
    .withMessage("House location required"),

  check("workLocation")
    .notEmpty()
    .withMessage("work location required"),
    
  check("phone")
      .optional()
      .isMobilePhone(["ar-IQ"])
      .withMessage("Invalid phone number only accepted Iraq Phone numbers"),

  check("workPhone")
      .optional()
      .isMobilePhone(["ar-IQ"])
      .withMessage("Invalid phone number only accepted Iraq Phone numbers"),

  check("locationOfUse")
    .notEmpty()
    .withMessage("location Of Use required"),

  check("neighborhood")
    .optional(),
  
  check("note")
    .optional(),

  check("typeOfIdentification")
    .notEmpty()
    .withMessage("type Of Identification required"),
    
  check("numberOfIdentification")
    .notEmpty()
    .withMessage("number Of Identification required"),

  check("issuingAuthority")
    .notEmpty()
    .withMessage("issuing Authority required"),

  check("ReleaseDate")
    .notEmpty()
    .withMessage("Release Date required"),

  check("expirationDate")
    .notEmpty()
    .withMessage("expiration Date required"),

  check("nationality")
    .notEmpty()
    .withMessage("nationality required"),

  check("birthDate")
    .notEmpty()
    .withMessage("birth Date required"),

  check("drivingLicenseNumber")
    .notEmpty()
    .withMessage("driving License Number required"),

  check("drivingLicenseIssueDate")
    .notEmpty()
    .withMessage("driving License Issue Date required"),

  check("drivingLicenseExpirationDate")
    .notEmpty()
    .withMessage("driving License Expiration Date required"),


  check("personalImage")
    .notEmpty()
    .withMessage("personal Image required"),

  check("personalDocumentsImag")
    .optional()
    .notEmpty()
    .withMessage("personal Documents Imag required"),

  validatorMiddleware,
];

exports.getTenantValidator = [
  check("id").isMongoId().withMessage("Invalid Tenant id format"),
  validatorMiddleware,
];

exports.updateTenantValidator = [
  check("id").isMongoId().withMessage("Invalid Teb id format"),
  check("name")
  .optional()
  .notEmpty()
  .withMessage("Tenant name required")
  .isLength({ min: 2 })
  .withMessage("Too short Tenant name"),

check("houseLocation")
  .optional()
  .notEmpty()
  .withMessage("House location required"),

check("workLocation")
  .optional()
  .notEmpty()
  .withMessage("Work location required"),

check("phone")
  .optional()
  .isMobilePhone(["ar-IQ"])
  .withMessage("Invalid phone number, only Iraq numbers accepted"),

check("workPhone")
  .optional()
  .isMobilePhone(["ar-IQ"])
  .withMessage("Invalid phone number, only Iraq numbers accepted"),

check("locationOfUse")
  .optional()
  .notEmpty()
  .withMessage("Location of use required"),

check("neighborhood")
  .optional(),

check("note")
  .optional(),

check("typeOfIdentification")
  .optional()
  .notEmpty()
  .withMessage("Type of identification required"),

check("numberOfIdentification")
  .optional()
  .notEmpty()
  .withMessage("Number of identification required"),

check("issuingAuthority")
  .optional()
  .notEmpty()
  .withMessage("Issuing authority required"),

check("ReleaseDate")
  .optional()
  .notEmpty()
  .withMessage("Release date required"),

check("expirationDate")
  .optional()
  .notEmpty()
  .withMessage("Expiration date required"),

check("nationality")
  .optional()
  .notEmpty()
  .withMessage("Nationality required"),

check("birthDate")
  .optional()
  .notEmpty()
  .withMessage("Birth date required"),

check("drivingLicenseNumber")
  .optional()
  .notEmpty()
  .withMessage("Driving license number required"),

check("drivingLicenseIssueDate")
  .optional()
  .notEmpty()
  .withMessage("Driving license issue date required"),

check("drivingLicenseExpirationDate")
  .optional()
  .notEmpty()
  .withMessage("Driving license expiration date required"),

  check("personalImage")
  .optional()
  .notEmpty()
  .withMessage("Personal image required"),

  check("personalDocumentsImag")
    .optional()
    .notEmpty()
    .withMessage("Personal documents image required"),
  
  validatorMiddleware,
];
;

exports.deleteTenantValidator = [
  check("id").isMongoId().withMessage("Invalid Tenant id format"),
  validatorMiddleware,
];


exports.getTenantUseNameValidator = [
  check("name")
    .notEmpty()
    .withMessage("Tenant required")
    .isLength({ min: 2 })
    .withMessage("Too short Tenant name"),

  validatorMiddleware,
];
