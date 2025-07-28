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
  createPdfFile,
  sendHtmlPage,
  getInsurance,
  getImportsPricesByDate
} = require("../controllers/contractController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN
router.use(auth.protect);
router.use(auth.allowedTo("admin"));

router.route("/")
.get(getContracts)
.post(createContractValidator, createContract);

router.route('/getInsurance').get(getInsurance);
router.route('/getImportsUseDate').get(getImportsPricesByDate);

router.route("/search")
.get(getContractUseNameValidator, getContractUseName)

router.route("/createPDF/:id")
  .get(createPdfFile)

  router.route("/htmlPage/:id")
  .get(sendHtmlPage)

router
  .route("/:id")
  .get(getContractValidator, getContract)
  .patch( updateContractValidator, updateContract)
  .delete(deleteContractValidator, deleteContract);

module.exports = router;
