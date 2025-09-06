const express = require('express');
 require("../utils/validators/bookingValidator");

const {
    createSystem,
    getSystem,
    updateSystem
} = require("../controllers/systemController");

const router = express.Router();

router.route("/")
.post(createSystem);


router
.route("/:id")
   .get(getSystem)
  .patch(updateSystem)

module.exports = router;
