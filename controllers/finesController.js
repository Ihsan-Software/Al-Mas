const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Fines = require("../models/finesModel");
const factory = require("./handlersFactory");

// for image
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const deleteOldImage  = require("../middlewares/deleteOldImage");

// use buffer from Memory Storage
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    const filename = `Fine-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/fines/${filename}`);

    // save image in db
    req.body.image = filename;
    next();
});

// Execute multer middleware
exports.uploadFineImage = uploadSingleImage("image");

exports.deleteOldFineImage = deleteOldImage(Fines, 'image', 'fines');

//  **** Admin CRUD ****

// @desc    Get list of Fine
// @route   GET /Fine
// @access  Private/ Admin, Manager
exports.getFines = factory.getAll(Fines);

// @desc    Get specific Fine by id
// @route   GET /Fine/:id
// @access  Private/ Admin, Manager
exports.getFine = factory.getOne(Fines);

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

  const allFines = await Fines.find();

  // Now filter based on populated `userID.name`
  const filteredFines = allFines.filter(fines =>
    fines.tenantID && fines.tenantID.name.toLowerCase().includes(name.toLowerCase())
  );

  res.status(200).json({
    data: filteredFines
  });
});









