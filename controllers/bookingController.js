const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Booking = require("../models/bookingModel");
const Car = require("../models/carModel")


//  **** Admin CRUD ****

// @desc    Get list of Booking
// @route   GET /Booking
// @access  Private/ Admin, Manager
exports.getBookings = factory.getAll(Booking);

// @desc    Get specific Booking by id
// @route   GET /Booking/:id
// @access  Private/ Admin, Manager
exports.getBooking = factory.getOne(Booking);

// @desc    Create Booking
// @route   POST  /Booking
//  @access  Private/ Admin, Manager
exports.createBooking =  asyncHandler(async (req, res, next) => {
    req.body.userID = req.user._id

    // update car status
    await Car.findByIdAndUpdate(req.body.carID, { carStatus: 'محجوزة' });

    // create Booking number
    const bookingCount = await Booking.countDocuments();
    req.body.BookingNumber = bookingCount + 1;
    const booking = await Booking.create(req.body);

    res.status(200).json({ data: booking });
});

// @desc    Update specific Booking
// @route   PUT /Booking/:id
// @access  Private/ Admin, Manager
exports.updateBooking = factory.updateOne(Booking)
// @desc    Delete specific Booking
// @route   DELETE /Booking/:id
// @access  Private/ Admin, Manager
exports.deleteBooking = factory.deleteOne(Booking);


// **** Booking CRUD ****

// @desc    Get Logged Booking data
// @route   GET /Booking getMe
// @access  Private/Protect
exports.getBookingUseName = asyncHandler(async (req, res, next) => {
 const name = req.query.name|| " ";

  const allBookings = await Booking.find();

  // Now filter based on populated `userID.name`
  const filteredBookings = allBookings.filter(Booking =>
    Booking.tenantID && Booking.tenantID.name.toLowerCase().includes(name.toLowerCase())
  );

  res.status(200).json({
    data: filteredBookings
  });
});








