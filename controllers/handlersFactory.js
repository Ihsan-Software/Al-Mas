const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

exports.getAll = (Model) => asyncHandler(async (req, res) => {

  const documents = await Model.find();

    res.status(200).json({results:documents.length , data: documents });
  });



exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
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

