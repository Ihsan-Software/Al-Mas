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
  getOneInsurance,
  getImportsPricesByDate,
  updateReturnContract,
  // for pdf
  getContractInfo,
  sendHtmlPage,
  sendEjsFile,
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
router.route('/getImportsUseDate').get(auth.allowedTo("admin"), getImportsPricesByDate);
router.use(auth.allowedTo("admin","employee"));

router.route("/")
.get(getContracts)
.post(createContractValidator, createContract);

router.route('/getInsurance').get(getInsurance);
router.route('/getOneInsurance/:id').get(getOneInsurance);

router.route("/search")
.get(getContractUseNameValidator, getContractUseName)


router.route("/createPdfFromEjsFile/:id")
  .get(createPdfFromEjsFile)

router.route("/getContractInfo/:id")
  .get(getContractInfo)
  
router.route("/updateReturnContract/:id")
  .patch(updateReturnContract)
router
  .route("/:id")
  .get(getContractValidator, getContract)
  .patch( updateContractValidator, updateContract)
  .delete(deleteContractValidator, deleteContract);

module.exports = router;
