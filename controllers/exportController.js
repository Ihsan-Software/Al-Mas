const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Export  = require("../models/exportModel");
const factory = require("./handlersFactory");



// **** Admin CRUD ****

// @desc    Get list of Exports
// @route   GET /exports
// @access  Private / Admin, Manager
exports.getExports = factory.getAll(Export,'','-carID');

// @desc    Get specific Export by ID
// @route   GET /exports/:id
// @access  Private / Admin, Manager
exports.getExport = factory.getOne(Export,'carID');

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
       exports = await Export.find().select('-carID');
    }
    else{
          // Convert to Date objects
          const startDate = new Date(dateQueryParam);
          startDate.setDate(1); // first day of month
          startDate.setHours(0, 0, 0, 0);

          // End of month
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1); // go to next month
          endDate.setDate(0); // last day of current month
          endDate.setHours(23, 59, 59, 999);
    
          exports = await Export.find({
              createdAt: {
                $gte: startDate,
                $lte: endDate
              }
            }).populate({path: 'carID', select: 'name'});

          }


  res.status(200).json({
    status: 'success',
    results: exports.length,
    data: exports
  });
});
