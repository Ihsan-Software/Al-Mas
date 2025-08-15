const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
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
    // contract details
    overtimeCost: {
        type: Number,
        required: [true, "Overtime cost  required"],
    },
    pricePaid: {
        type: Number,
        required: [true, "Amount paid required"],
    },
    duration: {
        type: Number,
        required: [true, "Duration required"],
    },
    timeUnit: {
        type: String,
        trim: true,
        required: [true, "time unit required"],
    },
    discount: {
        type: Number,
        required: [true, "Discount required"],
    },
    printTime: {
        type: String,
        trim: true,
    },
    totalPrice: {
        type: Number,
        required: [true, "totalPrice required"],
    },
    priceAfterDiscount: {
        type: Number,
        required: [true, "price After Discount required"],
    },
    RemainingPrice: {
        type: Number,
        required: [true, "price After Discount required"],
    },
    //التامينات
    insuranceType: {
        type: String,
        trim: true,
        required: [true, " Type of insurance required"],
    },
    governorate: {
        type: String,
        required: [true, "Governorate required"],
   },
  // معلومات السائق
    driverName: {
        type: String,
        default:""
   },
    cardNumber: {
        type: String,
        default:""
   },
    phone: {
        type: String,
        default:""
   },
    address: {
        type: String,
        default:""
   },
   // dynamic fields
    contractDate: {
        type: String,
        trim: true,
   },
    returnDate: {
        type: String,
        trim: true,
   },
    contractNumber: {
        type: String,
        trim: true,
   },
   isReturn:{
    type: Boolean,
    default: false
   },
    dailyPrice: {
        type: Number
    },

},
{ timestamps: true }
);

// Mongoose query middleware
/*contractSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userID tenantID carID'
  });
  next();
});*/
const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
