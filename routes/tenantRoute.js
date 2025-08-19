const express = require('express');
const {
  // FOR ADMIN
  getTenantValidator,
  createTenantValidator,
  updateTenantValidator,
  deleteTenantValidator,
  getTenantUseNameValidator,
  // FOR USER
  
} = require("../utils/validators/tenantValidator");

const {
  // FOR ADMIN
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  uploadTenantImage,
  resizeTenantImages,
  getTenantUseName,
  deleteOldTenantImage
} = require("../controllers/tenantController");

const auth = require("../controllers/authController");
const router = express.Router();

// FOR ADMIN
router.use(auth.protect);
router.use(auth.allowedTo("admin","employee"));

router.route("/")
  .get(getTenants)
  .post(uploadTenantImage, resizeTenantImages, createTenantValidator, createTenant);

router.route("/search")
  .get(getTenantUseNameValidator, getTenantUseName)
router
  .route("/:id")
  .get(getTenantValidator, getTenant)
  .patch(uploadTenantImage, deleteOldTenantImage, resizeTenantImages, updateTenantValidator, updateTenant)
  .delete(deleteTenantValidator, deleteTenant);

module.exports = router;
