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
    const filename = `user-${uuidv4()}-${Date.now()}.webp`;
    const uploadDir = process.env.RAILWAY_VOLUME_MOUNT_PATH 
                    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "users")
                    : path.join(__dirname, "../uploads/users");

    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("webp")
        .webp({ quality: 90 })
       .toFile(path.join(uploadDir, filename));

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
exports.updateUser = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ApiError(`No user for this id ${req.params.id}`, 404));
    }
    if(user.id == '68e00e789e2883abd527f3e8' && req.user.id!=user.id){
        return next(new ApiError(`You can't update this user until you are a admin`, 404));
    }

    // Update User fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.userDiscount) user.userDiscount = req.body.userDiscount;
    if (req.body.temporarilyDeleted) {
        user.temporarilyDeleted = req.body.temporarilyDeleted;
    }

    // Update UserInfo fields
    if (req.body.email || req.body.phone || req.body.image || req.body.role) {
        const userInfo = await UserInfo.findById(user.userInfoID);
        if (!userInfo) {
          return next(new ApiError(`No userInfo found for this user`, 404));
        }

        if (req.body.email) userInfo.email = req.body.email;
        if (req.body.phone) userInfo.phone = req.body.phone;
        if (req.body.image) userInfo.image = req.body.image;
        if (req.body.role) userInfo.role = req.body.role;
        await userInfo.save();
    }

    await user.save();
    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
        message: "User & UserInfo updated successfully",
        data: updatedUser,
    });

});
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
const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
  }

  // 2) Get linked UserInfo (where password is stored)
  const userInfo = await UserInfo.findById(user.userInfoID);
  if (!userInfo) {
    return next(new ApiError(`No userInfo found for this user`, 404));
  }

  userInfo.password = req.body.newPassword;

  await userInfo.save();
    res.status(200).json({ data: user });
});


exports.getUserDiscount = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).json({ userDiscount:user.userDiscount});
});