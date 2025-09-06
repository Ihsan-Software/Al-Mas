const express = require('express');

const {
  getStatistics,getCarStatistics
} = require("../controllers/statisticsController");

const auth = require("../controllers/authController");
const router = express.Router();

router.use(auth.protect);
router.route("/carStatistics").get(auth.allowedTo("admin"),getCarStatistics)
router.use(auth.allowedTo("admin","employee"));

// FOR admin and employee
router.route("/").get(getStatistics)

module.exports = router;
