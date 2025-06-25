const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const tenantSchema = new mongoose.Schema(
{
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
        type: Date,
        required: [true, "Release date required"],
    },
    expirationDate: {
        type: Date,
        required: [true, " Expiration date required"],
    },
    nationality: {
        type: String,
        trim: true,
        required: [true, "nationality required"],
    },
    birthDate: {
        type: Date,
        required: [true, " birth date required"],
    },
    drivingLicenseNumber: {
        type: String,
        trim: true,
        required: [true, "Driving license number required"],
    },
    drivingLicenseIssueDate: {
        type: Date,
        required: [true, " Driving license issue date required"],
    },
    drivingLicenseExpirationDate: {
        type: Date,
        required: [true, " Driving license expiration date required"],
    },
    personalImage: {
      type: String,
      required: [true, 'personal Image is required']
   },
   personalDocumentsImag:{
      type: [String],
      required: [true, 'personal Documents Image is required'],
   },
   isBlocked:{
    type: Boolean,
    default: false
   }

},
{ timestamps: true }
);


tenantSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const setImageURL = (doc) => {
  if (doc.personalImage) {
    const imageUrl = `${process.env.BASE_URL}/tenant/${doc.personalImage}`;
    doc.personalImage = imageUrl;
  }
  if (doc.personalDocumentsImag) {
    const personalDocumentsImagList = [];
    doc.personalDocumentsImag.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/tenant/${image}`;
      personalDocumentsImagList.push(imageUrl);
    });
    doc.personalDocumentsImag = personalDocumentsImagList;
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
