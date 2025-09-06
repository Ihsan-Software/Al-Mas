const factory = require("./handlersFactory");
const asyncHandler = require("express-async-handler");

const System = require("../models/systemModel");



exports.createSystem  = asyncHandler(async (req, res, next) => {
    const newDoc = await System.create(req.body);
    res.status(201).json({ data: newDoc });
  });
exports.getSystem = factory.getOne(System)
exports.updateSystem = factory.updateOne(System)