const express = require('express');

const {
  getStatistics
} = require("../controllers/statisticsController");

const auth = require("../controllers/authController");
const router = express.Router();

router.use(auth.protect);
router.use(auth.allowedTo("admin"));

// FOR manager
router.route("/").get(getStatistics)


module.exports = router;
