const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
    tenantID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tenant',
      required: [true, "tenant ID required"],

    },
    carID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
      required: [true, "car ID required"],
    },
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, "user ID required"],
    },
    // Booking details
    bookingDate: {
        type: String,
        required: [true, "Booking date required"],
    },
    hour: {
        type: String,
        required: [true, "hour required"],
    },
    day: {
        type: String,
        required: [true, "today required"],
    },
    totalPrice: {
        type: Number,
        required: [true, "totalPrice required"],
    },
    pricePaid: {
        type: Number,
        required: [true, "price Paid required"],
    },
    RemainingPrice: {
        type: Number,
        required: [true, "price After Discount required"],
    },
    BookingNumber: {
        type: Number,
    },
    governorate: {
      type: String,
      required: [true, "governorate required"],
    },
},
{ timestamps: true }
);

// Mongoose query middleware
/*bookingSchema.pre(/^find$/, function (next) {
  this.populate({
    path: 'userID tenantID carID'
  });
  next();
});*/
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
