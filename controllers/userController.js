const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const UserInfo = require("../models/userInfoModel");
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
exports.getUser = factory.getOne(User,'','  -password -createdAt -updatedAt -__v');

// @desc    Create user
// @route   POST  /users
// @access  Private/ Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    
const userInfo = await UserInfo.create({
    email: req.body.email,
    password: req.body.password,
    image: req.body.image,
    phone: req.body.phone,
    role: req.body.role,
    });

    // 2️⃣ Create User linked to UserInfo
    const user = await User.create({
        name: req.body.name,
        userInfoID: userInfo._id
    });

  res.status(201).json({ data: user });
});

// @desc    Update specific user
// @route   PUT /users/:id
// @access  Private/ Admin
exports.updateUser = factory.updateOne(User)
// @desc    Delete specific user
// @route   DELETE /users/:id
// @access  Private/ Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.temporarilyDeleted) {
        return res.status(400).json({ message: "Cannot delete this user yet" });
    }

    // 1️⃣ Get UserInfo
    const userInfo = await UserInfo.findById(user.userInfoID);
    if (userInfo && userInfo.image) {
        // 2️⃣ Extract image filename (assuming image URL format: BASE_URL/users/filename)
        const filename = userInfo.image.split("/users/")[1];
        console.log(filename)
        const filePath = path.join(__dirname, "../uploads/users", filename); // adjust path if needed

        // 3️⃣ Delete file if exists
        if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        }
    }

    // 4️⃣ Delete UserInfo document
    await UserInfo.findByIdAndDelete(user.userInfoID);

    res.status(200).json({ message: "User and image deleted successfully" });
});


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