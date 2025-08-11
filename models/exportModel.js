const mongoose = require("mongoose");

const exportSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, "user ID required"],
    },
  title: {
    type: String,
    required: [true, 'Export title is required'],
    trim: true,
  },
  details: {
    type: String,
    required: [true, 'Export details are required'],
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

const Export = mongoose.model('Export', exportSchema);

module.exports = Export;