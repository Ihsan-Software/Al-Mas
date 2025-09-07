const express = require('express');
const {
  // FOR ADMIN
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserPasswordValidator
} = require("../utils/validators/userValidator");

const {
  // FOR ADMIN
  getUsers,
  getUser,
  getUserDiscount,
  createUser,
  updateUser,
  updateLoggedUserPassword,
  deleteUser,
  uploadUserImage,
  resizeImage,
  deleteOldUserImage
} = require("../controllers/userController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN
router.use(auth.protect);
router.route("/userDiscount/:id")
.get(getUserDiscount)
router.use(auth.allowedTo("admin"));
router.route("/")
.get(getUsers)
.post(uploadUserImage, resizeImage, createUserValidator, createUser);

router.patch("/updateUserPassword/:id", updateLoggedUserPasswordValidator,updateLoggedUserPassword);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .patch( uploadUserImage, deleteOldUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
