const mongoose = require("mongoose");

const importSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, "user ID required"],
  },
  carID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Car',
    default: null,
  },
  title: {
    type: String,
    required: [true, 'Import title is required'],
    trim: true,
  },
  details: {
    type: String,
    required: [true, 'Import details are required'],
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number'],
  },
}, { timestamps: true });

const ImportModel  = mongoose.model('Import', importSchema);

module.exports = ImportModel ;