const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Car = require("../models/carModel");
const Fines = require("../models/finesModel");
const Contract = require("../models/contractModel");
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
    const filename = `car-${uuidv4()}-${Date.now()}.webp`;
    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("webp")
        .webp({ quality: 90 })
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
exports.getCars = factory.getAll(Car,'','id name carModel color dailyPrice carStatus');

// @desc    Get specific Car by id
// @route   GET /car/:id
// @access  Private/ Admin, Manager
exports.getCar = factory.getOne(Car,'','-createdAt -updatedAt -__v');

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
exports.deleteCar = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });

  if (!car.temporarilyDeleted) {
    return res.status(400).json({ message: "Cannot delete this car with all related info" });
  }

  // 1️⃣ Delete car image if exists
  if (car.image) {
    // Assuming image is stored like BASE_URL/cars/filename
    const filename = car.image.split("/cars/")[1];
    const filePath = path.join(__dirname, "../uploads/cars", filename); // adjust your path
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // 2️⃣ Delete related contracts
  await Contract.deleteMany({ carID: car._id });


  // 3️⃣ Delete related fines
  await Fines.deleteMany({ carID: car._id });


  // 4️⃣ Delete the car
  await Car.findByIdAndDelete(car._id);

  res.status(200).json({ message: "Car and all related data deleted successfully" });
});


// **** Car CRUD ****

// @desc    Get Logged Car data
// @route   GET /car getMe
// @access  Private/Protect
exports.getCarUseName = asyncHandler(async (req, res, next) => {

    // 1) Build query
    const car = await Car.findOne({name:req.query.name}).select('-createdAt -updatedAt -__v');

    if (!car) {
      return next(new ApiError(`No Car for this name: ${req.query.name}`, 404));
    }
    res.status(200).json({ data: car });
});









