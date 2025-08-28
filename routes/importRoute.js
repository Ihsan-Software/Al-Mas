const express = require('express');
const {
  createImportValidator,
  getImportValidator,
  updateImportValidator,
  deleteImportValidator
} = require('../utils/validators/importValidator');

const {
  getImports,
  createImport,
  getImport,
  updateImport,
  deleteImport,
  getImportsByDate,
} = require('../controllers/importController');

const auth = require("../controllers/authController");
const router = express.Router();

router.use(auth.protect);
router.route('/')
  .post(createImportValidator, createImport);

router.use(auth.allowedTo("admin"));

router.route('/')
  .get(getImports)
  .post(createImportValidator, createImport);

router.get('/getImportUseDate', getImportsByDate);

router.route('/:id')
  .get(getImportValidator, getImport)
  .patch(updateImportValidator, updateImport)
  .delete(deleteImportValidator, deleteImport);

module.exports =  router;
