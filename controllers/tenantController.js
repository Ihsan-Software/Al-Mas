const { v4: uuidv4 } = require("uuid"); //for random image name id
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Tenant = require("../models/tenantModel");
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
    if (req.files.personalDocumentsImag) {
        req.body.personalDocumentsImag = [];
        await Promise.all(
            req.files.personalDocumentsImag.map(async (img, index) => {
                const personalDocumentsImagName = `tenant-${uuidv4()}-${Date.now()}-personalDocumentsImag${index + 1}.jpeg`;

                await sharp(img.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({ quality: 95 })
                .toFile(`uploads/tenant/${personalDocumentsImagName}`);

                // Save image into our db
                req.body.personalDocumentsImag.push(personalDocumentsImagName);
            })
        );
        next();
    }else{
      next();
    }
    
});
const tenantImages = [
  {
    name: "personalImage",
    maxCount: 1,
  },
  {
    name: "personalDocumentsImag",
    maxCount: 2,
  },
];
exports.uploadTenantImage = uploadMixOfImages(tenantImages);

exports.deleteOldTenantImage = deleteOldImage(Tenant, 'personalImage', 'tenant');

//  **** Admin CRUD ****

// @desc    Get list of Tenant
// @route   GET /tenant
// @access  Private/ Admin, Manager
exports.getTenants = asyncHandler(async (req, res) => {
  const isBlockedStatus = req.query.isBlocked
  const tenant = await Tenant.find({isBlocked:isBlockedStatus});
    res.status(200).json({data: tenant });
  });


// @desc    Get specific Tenant by id
// @route   GET /tenant/:id
// @access  Private/ Admin, Manager
exports.getTenant = factory.getOne(Tenant);

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
exports.deleteTenant = factory.deleteOne(Tenant);


// **** Tenant CRUD ****

// @desc    Get Logged Tenant data
// @route   GET /tenant getMe
// @access  Private/Protect
exports.getTenantUseName = asyncHandler(async (req, res, next) => {

    // 1) Build query
    const tenant = await Tenant.findOne({name:req.query.name});

    if (!tenant) {
      return next(new ApiError(`No tenant for this name: ${req.query.name}`, 404));
    }
    res.status(200).json({ data: tenant });
});









