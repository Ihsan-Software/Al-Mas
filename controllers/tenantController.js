const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');
const ApiError = require("../utils/apiError");
const Tenant = require("../models/tenantModel");
const Fines = require("../models/finesModel");
const Contract = require("../models/contractModel");
const factory = require("./handlersFactory");

// for image
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const deleteOldImage  = require("../middlewares/deleteOldImage");
const { query } = require("express-validator");

exports.resizeTenantImages = asyncHandler(async (req, res, next) => {

  //1- Image processing for personalImage
    if (req.files.personalImage) {
        const personalImageFileName = `tenant-${uuidv4()}-${Date.now()}-personalImage.webp`;

        await sharp(req.files.personalImage[0].buffer)
        .resize(600, 600)
        .toFormat("webp")
        .webp({ quality: 90 })
        .toFile(`uploads/tenant/${personalImageFileName}`);

        // Save image into our db
        req.body.personalImage = personalImageFileName;
    }
    //2- Image processing for images
    if (req.files.personalDocumentsImagRequired) {
        const personalDocumentsImagRequiredFileName = `tenant-${uuidv4()}-${Date.now()}-personalDocumentsImagRequired.jpeg`;

        await sharp(req.files.personalDocumentsImagRequired[0].buffer)
        .resize(2200, 3000)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/tenant/${personalDocumentsImagRequiredFileName}`);

        // Save image into our db
        req.body.personalDocumentsImagRequired = personalDocumentsImagRequiredFileName;

    }
    if (req.files.personalDocumentsImagOptional) {
        const personalDocumentsImagOptionalFileName = `tenant-${uuidv4()}-${Date.now()}-personalDocumentsImagOptional.jpeg`;

        await sharp(req.files.personalDocumentsImagOptional[0].buffer)
        .resize(2200, 3000)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/tenant/${personalDocumentsImagOptionalFileName}`);

        // Save image into our db
        req.body.personalDocumentsImagOptional = personalDocumentsImagOptionalFileName;
    }
    
    next();

});
const tenantImages = [
  {
    name: "personalImage",
    maxCount: 1,
  },
  {
    name: "personalDocumentsImagRequired",
    maxCount: 1,
  },
  {
    name: "personalDocumentsImagOptional",
    maxCount: 1,
  },
];
exports.uploadTenantImage = uploadMixOfImages(tenantImages);

exports.deleteOldTenantImage = deleteOldImage(Tenant, 'personalImage', 'tenant');

//  **** Admin CRUD ****

// @desc    Get list of Tenant
// @route   GET /tenant
// @access  Private/ Admin, Manager
exports.getTenants = asyncHandler(async (req, res) => {
  let tenants
  if (req.query.isBlocked){
     tenants = await Tenant.find({isBlocked:req.query.isBlocked,temporarilyDeleted: false }).select('id name houseLocation phone isBlocked');
  }
  else{
     tenants = await Tenant.find({temporarilyDeleted: false }).select('id name houseLocation phone isBlocked').sort({ isBlocked: 1 });
  }
    res.status(200).json({results:tenants.length, data: tenants });
  });


// @desc    Get specific Tenant by id
// @route   GET /tenant/:id
// @access  Private/ Admin, Manager
exports.getTenant = factory.getOne(Tenant,'',' -createdAt -updatedAt -__v');

// @desc    Create tenant
// @route   POST  /tenant
//  @access  Private/ Admin, Manager
exports.createTenant = factory.createOne(Tenant);

// @desc    Update specific Tenant
// @route   PUT /tenant/:id
// @access  Private/ Admin, Manager
exports.updateTenant = factory.updateOne(Tenant)
// @desc    Delete specific Tenant
// @route   DELETE /tenant/:id
// @access  Private/ Admin, Manager
exports.deleteTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  // 1️⃣ Check if tenant exists
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  // 2️⃣ Only proceed if tenant is marked for deletion
  if (!tenant.temporarilyDeleted) {
    return res.status(400).json({ message: 'Cannot delete this tenant with all related info' });
  }

  // 3️⃣ Helper function to delete image safely
  const deleteImage = (imageField) => {
    if (!imageField) return;

    // If only filename is stored, adjust path accordingly
    const imagePath = path.join(__dirname, "../uploads/tenant", imageField.split("/tenant/")[1])
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      console.warn('File not found:', imagePath);
    }
  };

  // 4️⃣ Delete all images if they exist
  deleteImage(tenant.personalImage);
  deleteImage(tenant.personalDocumentsImagRequired);
  deleteImage(tenant.personalDocumentsImagOptional);

  // 5️⃣ Delete all related contracts & fines
  await Contract.deleteMany({ tenantID: tenant._id });
  await Fines.deleteMany({ tenantID: tenant._id });

  // 6️⃣ Delete tenant
  await Tenant.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Tenant and all related data deleted successfully' });
});


// **** Tenant CRUD ****

// @desc    Get Logged Tenant data
// @route   GET /tenant getMe
// @access  Private/Protect
exports.getTenantUseName = asyncHandler(async (req, res, next) => {

    // 1) Build query
    const tenant = await Tenant.findOne({name:req.query.name}).select('-createdAt -updatedAt -__v');

    if (!tenant) {
      return next(new ApiError(`No tenant for this name: ${req.query.name}`, 404));
    }
    res.status(200).json({ data: tenant });
});









