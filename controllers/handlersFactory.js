const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

exports.getAll = (Model, populationOpt, selectedFields) =>
  asyncHandler(async (req, res) => {
    let filter = {};

    const modelName = Model.modelName; // "Export" or "Import"
    // Only apply carID filter if this is Export or Import model
    if (["Export", "Import"].includes(modelName) && req.query.hasCar !== undefined) {
      if (req.query.hasCar === "true") {
        filter.carID = { $ne: null }; // with car
      } else if (req.query.hasCar === "false") {
        filter.carID = null; // without car
      }
    } 
    else if(Model.modelName ==='Car' && req.query.carStatus!==undefined){
      filter.carStatus =  { $regex: `^${req.query.carStatus.trim()}$`, $options: "i" };
    }
    else {
      // hasCar NOT sent → use temporarilyDeleted filter
      filter = { temporarilyDeleted: false };
    }
    // Build the query
    let query = Model.find(filter).select(selectedFields);

    // Apply population if needed
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    const documents = await query;

    res.status(200).json({
      results: documents.length,
      data: documents,
    });
  });

exports.getAllDocWthNoRelation = (Model, populationOpt, selectedFields) =>
  asyncHandler(async (req, res) => {
    let query = Model.find().select(selectedFields);

    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    const documents = await query;

    res.status(200).json({
      results: documents.length,
      data: documents
    });
  });

exports.getOne = (Model, populationOpt, selectedFields) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id).select(selectedFields);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });



exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    req.body.userID = req.user._id
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.updateOne = (Model) => asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    //document.save();
    res.status(200).json({ data: document });
});

exports.deleteOne = (Model) => asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    // Trigger "remove" event when update document
    //document.remove();
    res.status(204).send();
  }
);

