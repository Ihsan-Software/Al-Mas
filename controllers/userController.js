const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const factory = require("./handlersFactory");
const createToken = require("../utils/createToken");

// for image
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const deleteOldImage  = require("../middlewares/deleteOldImage");

// use buffer from Memory Storage
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/users/${filename}`);

    // save image in db
    req.body.image = filename;
    next();
});

// Execute multer middleware
exports.uploadUserImage = uploadSingleImage("image");
exports.deleteOldUserImage = deleteOldImage(User, 'image', 'users');

//  **** Admin CRUD ****

// @desc    Get list of users
// @route   GET /users
// @access  Private/ Admin
exports.getUsers = factory.getAll(User,'',' -temporarilyDeleted -password -createdAt -updatedAt -__v');

// @desc    Get specific user by id
// @route   GET /users/:id
// @access  Private/ Admin
exports.getUser = factory.getOne(User,'','-temporarilyDeleted  -password -createdAt -updatedAt -__v');

// @desc    Create user
// @route   POST  /users
// @access  Private/ Admin
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /users/:id
// @access  Private/ Admin
exports.updateUser = factory.updateOne(User)
// @desc    Delete specific user
// @route   DELETE /users/:id
// @access  Private/ Admin
exports.deleteUser = factory.deleteOne(User);


// @desc    Update logged user password
// @route   PUT /users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
        password: await bcrypt.hash(req.body.newPassword, 12),
        },
        {
        new: true,
        runValidators: true,
        }
    );

    // 2) Generate token
    res.status(200).json({ data: user });
});