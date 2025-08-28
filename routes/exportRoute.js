const express = require('express');
const {
  createExportValidator,
  getExportValidator,
  updateExportValidator,
  deleteExportValidator
} = require('../utils/validators/exportValidator');

const {
  getExports,
  createExport,
  getExport,
  updateExport,
  deleteExport,
  getExportsByDate,
} = require('../controllers/exportController');

const auth = require("../controllers/authController");
const router = express.Router();

router.use(auth.protect);

router.route('/')
  .post(createExportValidator, createExport);
router.use(auth.allowedTo("admin"));

router.route('/')
  .get(getExports)

router.get('/getExportUseDate', getExportsByDate);

router.route('/:id')
  .get(getExportValidator, getExport)
  .patch(updateExportValidator, updateExport)
  .delete(deleteExportValidator, deleteExport);

module.exports =  router;
