const express = require('express');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const {
  uploadUserImage,
  resizeImage,
} = require('../controllers/userController');


const {
  signup,
  login,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup',uploadUserImage, resizeImage, signupValidator, signup);
router.post('/login', loginValidator, login);


module.exports = router;
