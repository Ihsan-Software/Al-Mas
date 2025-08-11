const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dayjs = require('dayjs');
const tenantSchema = new mongoose.Schema(
{
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, "user ID required"],
    },
    name: {
        type: String,
        trim: true,
        required: [true, "name required"],
    },
    houseLocation: {
        type: String,
        trim: true,
        required: [true, "Housing location required"],
    },
    workLocation: {
        type: String,
        trim: true,
        required: [true, "Work location required"],
    },
    phone: {
        type: String,
        required: [true, "Phone required"],
    },
    workPhone: {
        type: String,
        trim: true,
        required: [true, " Work Phone required"],
    },
    locationOfUse: {
        type: String,
        trim: true,
        required: [true, " location of use required"],
    },
    neighborhood: {
        type: String,
        trim: true,
        default: "",
    },
    note: {
        type: String,
        trim: true,
        default: "",
    },
    typeOfIdentification: {
        type: String,
        trim: true,
        required: [true, " Type of identification required"],
    },
    numberOfIdentification: {
        type: String,
        trim: true,
        required: [true, "Number of identification required"],
    },
    issuingAuthority: {
        type: String,
        trim: true,
        required: [true, "issuing authority required"],
    },
    ReleaseDate: {
        type: String,
        required: [true, "Release date required"],
    },
    expirationDate: {
        type: String,
        required: [true, " Expiration date required"],
    },
    nationality: {
        type: String,
        trim: true,
        required: [true, "nationality required"],
    },
    birthDate: {
        type: String,
        required: [true, " birth date required"],
    },
    drivingLicenseNumber: {
        type: String,
        trim: true,
        required: [true, "Driving license number required"],
    },
    drivingLicenseIssueDate: {
        type: String,
        required: [true, " Driving license issue date required"],
    },
    drivingLicenseExpirationDate: {
        type: String,
        required: [true, " Driving license expiration date required"],
    },
    personalImage: {
      type: String,
      required: [true, 'personal Image is required']
   },
   personalDocumentsImagRequired:{
    type: String,
    required: [true, 'Required personal Documents Image  is required'],
   },
   personalDocumentsImagOptional:{
    type: String,
    default: 'default.jpg'
   },
   isBlocked:{
    type: Boolean,
    default: false
   },
    temporarilyDeleted:{
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);


const setImageURL = (doc) => {
  if (doc.personalImage && !doc.personalImage.includes(`${process.env.BASE_URL}`)) {
    const imageUrl = `${process.env.BASE_URL}/tenant/${doc.personalImage}`;
    doc.personalImage = imageUrl;
  }


  if (doc.personalDocumentsImagRequired && !doc.personalDocumentsImagRequired.includes(`${process.env.BASE_URL}`)) {
    const imageUrl = `${process.env.BASE_URL}/tenant/${doc.personalDocumentsImagRequired}`;
    doc.personalDocumentsImagRequired = imageUrl;
  }

  if (doc.personalDocumentsImagOptional && !doc.personalDocumentsImagOptional.includes(`${process.env.BASE_URL}`)) {
    const imageUrl = `${process.env.BASE_URL}/tenant/${doc.personalDocumentsImagOptional}`;
    doc.personalDocumentsImagOptional = imageUrl;
  }

};
// findOne, findAll and update
tenantSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
tenantSchema.post('save', (doc) => {
  setImageURL(doc);
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
