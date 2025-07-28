const mongoose = require("mongoose");

const finesSchema = new mongoose.Schema(
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
    fineDate: {
        type: String,
        trim: true,
        required: [true, "Fine date required"],
    },
    finePlace: {
        type: String,
        trim: true,
        required: [true, "fine Place required"],
    },
    fineNumber: {
        type: Number,
        required: [true, "fine Number required"],
    },
    RemainingPrice: {
        type: Number,
        required: [true, "remaining price required"],
    },
    pricePaid: {
        type: Number,
        trim: true,
        required: [true, "price Paid required"],
    },
    note: {
        type: String,
        trim: true,
        default: ''
    }
},
{ timestamps: true }
);

// Mongoose query middleware
finesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userID tenantID carID'
  });
  next();
});

const setImageURL = (doc) => {
    if (doc.image && !doc.image.includes(`${process.env.BASE_URL}`)) {
        const imageUrl = `${process.env.BASE_URL}/fines/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll and update
finesSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
finesSchema.post('save', (doc) => {
  setImageURL(doc);
});

const Fines = mongoose.model("Fines", finesSchema);

module.exports = Fines;
