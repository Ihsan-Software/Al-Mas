const express = require('express');
const {
  // FOR ADMIN
  getCarValidator,
  createCarValidator,
  updateCarValidator,
  deleteCarValidator,
  getCarUseNameValidator,
  // FOR USER
  
} = require("../utils/validators/carValidator");

const {
  // FOR ADMIN
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImage,
  resizeImage,
  getCarUseName,
  deleteOldCarImage
} = require("../controllers/carController");

const auth = require("../controllers/authController");
const router = express.Router();

router.use(auth.protect);

// FOR manager
router.route("/").get(getCars)
router.route("/:id").get(getCarValidator, getCar)
router.route("/search")
  .get(getCarUseNameValidator, getCarUseName)

// FOR ADMIN
router.use(auth.allowedTo("admin"));

router.route("/").post(uploadCarImage, resizeImage, createCarValidator, createCar);

router
  .route("/:id")
  .patch(uploadCarImage, deleteOldCarImage, resizeImage, updateCarValidator, updateCar)
  .delete(deleteCarValidator, deleteCar);

module.exports = router;
