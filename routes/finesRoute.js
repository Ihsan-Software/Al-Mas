const express = require('express');
const {
  // FOR ADMIN
  getFineValidator,
  createFineValidator,
  updateFineValidator,
  deleteFineValidator,
  getFineUseNameValidator,
  // FOR USER
  
} = require("../utils/validators/finesValidator");

const {
  // FOR ADMIN
  getFines,
  getFine,
  createFine,
  updateFine,
  deleteFine,
  getFineUseName
} = require("../controllers/finesController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN
router.use(auth.protect);
router.use(auth.allowedTo("admin","employee"));

router.route("/")
  .get(getFines)
  .post(createFineValidator, createFine);

router.route("/search")
  .get(getFineUseNameValidator, getFineUseName)

router
  .route("/:id")
  .get(getFineValidator, getFine)
  .patch(updateFineValidator, updateFine)
  .delete(deleteFineValidator, deleteFine);

module.exports = router;
