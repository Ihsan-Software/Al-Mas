const express = require('express');
const {
  // FOR ADMIN
  getContractValidator,
  createContractValidator,
  updateContractValidator,
  deleteContractValidator,
  getContractUseNameValidator,
  // FOR USER
  
} = require("../utils/validators/contractValidator");

const {
  // FOR ADMIN
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getContractUseName,
  getInsurance,
  getImportsPricesByDate,
  sendHtmlPage,
  sendEjsFile,
  createPdfFile,
  generateContractPDFFromHtml,
  createPdfFileUseCore,
  createPdfFromEjsFile
} = require("../controllers/contractController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN
router.route("/sendEjsFile/:id")
  .get(sendEjsFile)

router.route("/htmlPage/:id")
  .get(sendHtmlPage)

router.use(auth.protect);
router.use(auth.allowedTo("admin"));

router.route("/")
.get(getContracts)
.post(createContractValidator, createContract);

router.route('/getInsurance').get(getInsurance);
router.route('/getImportsUseDate').get(getImportsPricesByDate);

router.route("/search")
.get(getContractUseNameValidator, getContractUseName)

router.route("/createPdfFile/:id")
  .get(createPdfFile)

router.route("/generateContractPDFFromHtml/:id")
  .get(generateContractPDFFromHtml)

router.route("/createPdfFileUseCore/:id")
  .get(createPdfFileUseCore)

router.route("/createPdfFromEjsFile/:id")
  .get(createPdfFromEjsFile)


router
  .route("/:id")
  .get(getContractValidator, getContract)
  .patch( updateContractValidator, updateContract)
  .delete(deleteContractValidator, deleteContract);

module.exports = router;
