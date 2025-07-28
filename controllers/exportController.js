const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Export  = require("../models/exportModel");
const factory = require("./handlersFactory");



// **** Admin CRUD ****

// @desc    Get list of Exports
// @route   GET /exports
// @access  Private / Admin, Manager
exports.getExports = factory.getAll(Export);

// @desc    Get specific Export by ID
// @route   GET /exports/:id
// @access  Private / Admin, Manager
exports.getExport = factory.getOne(Export);

// @desc    Create new Export
// @route   POST /exports
// @access  Private / Admin, Manager
exports.createExport = factory.createOne(Export);

// @desc    Update specific Export
// @route   PATCH /exports/:id
// @access  Private / Admin, Manager
exports.updateExport = factory.updateOne(Export);

// @desc    Delete specific Export
// @route   DELETE /exports/:id
// @access  Private / Admin, Manager
exports.deleteExport = factory.deleteOne(Export);


exports.getExportsByDate = asyncHandler(async (req, res) => {
  const dateQueryParam = req.query.date; // e.g. '2025-07-28'
  let  exports
    if (!dateQueryParam) {
       exports = await Export.find();
    }
    else{
      // Convert to Date objects
      const start = new Date(dateQueryParam);
      const end = new Date(dateQueryParam);
      end.setHours(23, 59, 59, 999); // end of the same day
    
       exports = await Export.find({
        createdAt: {
          $gte: start,
          $lte: end
        }
      });

    }


  res.status(200).json({
    status: 'success',
    results: exports.length,
    data: exports
  });
});
