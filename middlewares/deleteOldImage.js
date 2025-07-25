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
    const { id } = req.params

    console.log(Model, imageField, uploadFolder)
    const doc = await Model.findById(id);
    if (!doc) {
      return next(new ApiError(`No document found for this ID: ${id} To delete older image`, 404));
    }
    // for delete tenant images 
    if(imageField == 'personalImage'){
      let names=['personalImage', 'personalDocumentsImagRequired', 'personalDocumentsImagOptional']
      names.forEach((currentName) => {
        let oldImage = doc[currentName];
        oldImage = oldImage.replace(`${process.env.BASE_URL}/${uploadFolder}`, "");
        if (oldImage) {
          const imagePath = path.join(__dirname, `../uploads/${uploadFolder}/`, oldImage);
          fs.unlinkSync(imagePath, (err) => {
            if (err && err.code !== 'ENOENT') {
              console.error(`Failed to delete old image:`, err);
            }
          });
        }
      });
    }
    // for delete other model image
    else{
      let oldImage = doc[imageField];
      oldImage = oldImage.replace(`${process.env.BASE_URL}/${uploadFolder}`, "");
      console.log(oldImage)
      if (oldImage) {
        const imagePath = path.join(__dirname, `../uploads/${uploadFolder}/`, oldImage);
        fs.unlinkSync(imagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete old image:`, err);
          }
        });}
    }
    next();
  });


  

module.exports = deleteOldImage;
