const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Fines = require("../models/finesModel");
const factory = require("./handlersFactory");



//  **** Admin CRUD ****

// @desc    Get list of Fine
// @route   GET /Fine
// @access  Private/ Admin, Manager
exports.getFines = factory.getAllDocWthNoRelation(Fines,[
    { path: 'carID', select: 'name' },
    { path: 'tenantID', select: 'name' }
  ],
  'finePlace fineDate');

// @desc    Get specific Fine by id
// @route   GET /Fine/:id
// @access  Private/ Admin, Manager
exports.getFine = factory.getOne(Fines,[
    { path: 'carID', select: 'name' },
    { path: 'tenantID', select: 'name' }
  ],'-createdAt -updatedAt -__v');

// @desc    Create Fine
// @route   POST  /Fine
//  @access  Private/ Admin, Manager
exports.createFine = factory.createOne(Fines);

// @desc    Update specific Fine
// @route   PUT /Fine/:id
// @access  Private/ Admin, Manager
exports.updateFine = factory.updateOne(Fines)
// @desc    Delete specific Fine
// @route   DELETE /Fine/:id
// @access  Private/ Admin, Manager
exports.deleteFine = factory.deleteOne(Fines);


// **** Fine CRUD ****

// @desc    Get Logged Fine data
// @route   GET /Fine getMe
// @access  Private/Protect
exports.getFineUseName = asyncHandler(async (req, res, next) => {
 const name = req.query.name|| " ";

  const allFines = await Fines.find().populate([
    { path: 'tenantID' },
    { path: 'carID'},
    { path: 'userID'}
  ]);

  // Now filter based on populated `userID.name`
  const filteredFines = allFines.filter(fines =>
    fines.tenantID && fines.tenantID.name.toLowerCase().includes(name.toLowerCase())
  );

  res.status(200).json({
    data: filteredFines
  });
});









