const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
{
    name: {
        type: String,
        trim: true,
        required: [true, "name required"],
    },
    carType: {
        type: String,
        trim: true,
        required: [true, "Car type required"],
    },
    color: {
        type: String,
        trim: true,
        required: [true, "Color required"],
    },
    carModel: {
        type: String,
        trim: true,
        required: [true, "Car model required"],
    },
    carNumber: {
        type: String,
        trim: true,
        required: [true, "Car number required"],
    },
    chassisNumber: {
        type: String,
        trim: true,
        required: [true, "Chassis number required"],
    },
    walkingCounter: {
        type: String,
        trim: true,
        required: [true, " Walking counter required"],
    },
    licenseNumber: {
        type: String,
        trim: true,
        required: [true, " Walking counter required"],
    },
    image: {
        type: String,
        required: [true, "image required"],
   },
    carStatus: { 
    type: String, 
    enum: ['متاحة', 'محجوزة', 'مؤجرة', 'تحت الصيانة','غير متاحة'], 
    default: 'متاحة' 
  }

},
{ timestamps: true }
);

const setImageURL = (doc) => {
    if (doc.image && !doc.image.includes(`${process.env.BASE_URL}`)) {
        const imageUrl = `${process.env.BASE_URL}/cars/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll and update
carSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
carSchema.post('save', (doc) => {
  setImageURL(doc);
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
