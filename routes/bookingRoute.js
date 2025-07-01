const express = require('express');
const {
  // FOR ADMIN
  getBookingValidator,
  createBookingValidator,
  updateBookingValidator,
  deleteBookingValidator,
  getBookingUseNameValidator,
  // FOR USER
  
} = require("../utils/validators/bookingValidator");

const {
  // FOR ADMIN
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingUseName
} = require("../controllers/bookingController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN

router.use(auth.protect);
router.use(auth.allowedTo("admin"));

router.route("/")
  .get(getBookings)
  .post(createBookingValidator, createBooking);

router.route("/search")
  .get(getBookingUseNameValidator, getBookingUseName)



router
  .route("/:id")
  .get(getBookingValidator, getBooking)
  .patch( updateBookingValidator, updateBooking)
  .delete(deleteBookingValidator, deleteBooking);

module.exports = router;
