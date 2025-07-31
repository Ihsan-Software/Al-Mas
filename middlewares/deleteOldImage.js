const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError'); // adjust the path if needed

/**
 * Middleware to delete old image from the file system
 * @param {Mongoose.Model} Model - Mongoose model (e.g., User)
 * @param {string} imageField - The field name that contains the image file name (e.g., "image")
 * @param {string} uploadFolder - The folder where images are stored (relative to root, default: 'uploads')
 */
const deleteOldImage = (Model, imageField, uploadFolder) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);

    if (!doc) {
      return next(new ApiError(`No document found for this ID: ${id}`, 404));
    }

    // For multiple images (e.g., req.files.personalImage, req.files.passportImage)
    if (req.files && Object.keys(req.files).length > 0) {
      const uploadedFields = Object.keys(req.files); // ['personalImage', 'passportImage', etc.]
      
      uploadedFields.forEach((fieldName) => {
        const oldImageUrl = doc[fieldName];
        if (oldImageUrl) {
          const oldImageName = oldImageUrl.replace(`${process.env.BASE_URL}/${uploadFolder}/`, '');
          const imagePath = path.join(__dirname, `../uploads/${uploadFolder}/`, oldImageName);

          try {
            fs.unlinkSync(imagePath);
            console.log(`Deleted old image for field "${fieldName}"`);
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.error(`Error deleting image ${oldImageName}:`, err);
            }
          }
        }
      });
    }

    // For single image (e.g., req.file)
    if (req.file && imageField) {
      const oldImageUrl = doc[imageField];
      if (oldImageUrl) {
        const oldImageName = oldImageUrl.replace(`${process.env.BASE_URL}/${uploadFolder}/`, '');
        const imagePath = path.join(__dirname, `../uploads/${uploadFolder}/`, oldImageName);

        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted old image for field "${imageField}"`);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error(`Error deleting image ${oldImageName}:`, err);
          }
        }
      }
    }

    next();
  });


  

module.exports = deleteOldImage;
