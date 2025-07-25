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

// FOR ADMIN
router.use(auth.protect);
router.use(auth.allowedTo("admin"));

router.route("/")
  .get(getCars)
  .post(uploadCarImage, resizeImage, createCarValidator, createCar);

router.route("/search")
  .get(getCarUseNameValidator, getCarUseName)
router
  .route("/:id")
  .get(getCarValidator, getCar)
  .patch(uploadCarImage, deleteOldCarImage, resizeImage, updateCarValidator, updateCar)
  .delete(deleteCarValidator, deleteCar);

module.exports = router;
