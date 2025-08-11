const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

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
        const personalImageFileName = `tenant-${uuidv4()}-${Date.now()}-personalImage.jpeg`;

        await sharp(req.files.personalImage[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/tenant/${personalImageFileName}`);

        // Save image into our db
        req.body.personalImage = personalImageFileName;
    }
    //2- Image processing for images
    if (req.files.personalDocumentsImagRequired) {
        const personalDocumentsImagRequiredFileName = `tenant-${uuidv4()}-${Date.now()}-personalDocumentsImagRequired.jpeg`;

        await sharp(req.files.personalDocumentsImagRequired[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/tenant/${personalDocumentsImagRequiredFileName}`);

        // Save image into our db
        req.body.personalDocumentsImagRequired = personalDocumentsImagRequiredFileName;

    }
    if (req.files.personalDocumentsImagOptional) {
        const personalDocumentsImagOptionalFileName = `tenant-${uuidv4()}-${Date.now()}-personalDocumentsImagOptional.jpeg`;

        await sharp(req.files.personalDocumentsImagOptional[0].buffer)
        .resize(2000, 1333)
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
  // chick if there exist tenant
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }


  if (tenant.temporarilyDeleted) {

    // Find all contracts and fines related to this tenant
    const contract = await Contract.findOne({ tenantID: tenant._id  });
    const fines = await Fines.findOne({ tenantID: tenant._id  });

     // Delete all contracts and fines related to this tenant
    await Contract.findByIdAndDelete(contract.id);
    await Fines.findByIdAndDelete(fines.id);

    // Delete the tenant
    await Tenant.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Tenant and all related data deleted successfully' });
  } else {
    return res.status(400).json({ message: 'Can not delete this tenant with his all related info' });
  }

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









