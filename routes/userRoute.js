const express = require('express');
const {
  // FOR ADMIN
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  // FOR USER
  updateLoggedUserValidator
} = require("../utils/validators/userValidator");

const {
  // FOR ADMIN
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  // FOR USER
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  deleteOldUserImage
} = require("../controllers/userController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR USER
router.use(auth.protect);

router.get("/getMyInfo", getLoggedUserData, getUser);
router.patch("/updateMyPassword", updateLoggedUserPassword);
router.patch("/updateMyInfo",uploadUserImage, resizeImage,  updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMyAccount", deleteLoggedUserData);


// FOR ADMIN
router.use(auth.allowedTo("admin"));
router.route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);


router
  .route("/:id")
  .get(getUserValidator, getUser)
  .patch(uploadUserImage, deleteOldUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
