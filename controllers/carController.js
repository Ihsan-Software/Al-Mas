const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Car = require("../models/carModel");
const factory = require("./handlersFactory");

// for image
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const deleteOldImage  = require("../middlewares/deleteOldImage");
const { query } = require("express-validator");

// use buffer from Memory Storage
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    const filename = `car-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/cars/${filename}`);

    // save image in db
    req.body.image = filename;
    next();
});

// Execute multer middleware
exports.uploadCarImage = uploadSingleImage("image");

exports.deleteOldCarImage = deleteOldImage(Car, 'image', 'cars');

//  **** Admin CRUD ****

// @desc    Get list of Car
// @route   GET /car
// @access  Private/ Admin, Manager
exports.getCars = factory.getAll(Car);

// @desc    Get specific Car by id
// @route   GET /car/:id
// @access  Private/ Admin, Manager
exports.getCar = factory.getOne(Car);

// @desc    Create Car
// @route   POST  /car
//  @access  Private/ Admin, Manager
exports.createCar = factory.createOne(Car);

// @desc    Update specific Car
// @route   PUT /car/:id
// @access  Private/ Admin, Manager
exports.updateCar = factory.updateOne(Car)
// @desc    Delete specific Car
// @route   DELETE /car/:id
// @access  Private/ Admin, Manager
exports.deleteCar = factory.deleteOne(Car);


// **** Car CRUD ****

// @desc    Get Logged Car data
// @route   GET /car getMe
// @access  Private/Protect
exports.getCarUseName = asyncHandler(async (req, res, next) => {

    // 1) Build query
    const car = await Car.findOne({name:req.query.name});

    if (!car) {
      return next(new ApiError(`No Car for this name: ${req.query.name}`, 404));
    }
    res.status(200).json({ data: car });
});









