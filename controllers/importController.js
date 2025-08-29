const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ImportModel  = require("../models/importModel");
const factory = require("./handlersFactory");



// **** Admin CRUD ****

// @desc    Get list of Import
// @route   GET /Import
// @access  Private / Admin, Manager
exports.getImports = factory.getAll(ImportModel,'','-carID');
// @desc    Get specific Import by ID
// @route   GET /Import/:id
// @access  Private / Admin, Manager
exports.getImport = factory.getOne(ImportModel,'carID');

// @desc    Create new Import
// @route   POST /Imports
// @access  Private / Admin, Manager
exports.createImport = factory.createOne(ImportModel);

// @desc    Update specific Import
// @route   PATCH /Import/:id
// @access  Private / Admin, Manager
exports.updateImport = factory.updateOne(ImportModel);

// @desc    Delete specific Import
// @route   DELETE /Imports/:id
// @access  Private / Admin, Manager
exports.deleteImport = factory.deleteOne(ImportModel);


exports.getImportsByDate = asyncHandler(async (req, res) => {
  const dateQueryParam = req.query.date; // e.g. '2025-07-28'
  let  result
    if (!dateQueryParam) {
       result = await ImportModel.find();
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
    
          result = await ImportModel.find({
              createdAt: {
                $gte: startDate,
                $lte: endDate
              }
            }).populate({path: 'carID', select: 'name'});

          }


  res.status(200).json({
    status: 'success',
    results: result.length,
    data: result
  });
});
