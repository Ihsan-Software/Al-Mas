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
    // Skip if no new file uploaded
    if ((Model =='User' && !req.file) ) {
      return next();
    }else if(Model =='Car' && !req.file){
       return next();
    }else if(Model =='Fines' && !req.file){
      console.log('gg')
       return next();
    }
    else if(Model =='Tenant' && !req.files){
       return next();
    }

    const doc = await Model.findById(id);
    if (!doc) {
      return next(new ApiError(`No document found for this ID: ${id}`, 404));
    }
    let oldImage = doc[imageField];
    oldImage = oldImage.replace(`${process.env.BASE_URL}/${uploadFolder}`, "");

    if (oldImage) {
      const imagePath = path.join(__dirname, `../uploads/${uploadFolder}/`, oldImage);
      fs.unlinkSync(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete old image:`, err);
        }
      });
    }

    next();
  });


  

module.exports = deleteOldImage;
