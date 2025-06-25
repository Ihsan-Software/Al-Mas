const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        trim: true,
        required: [true, "name required"],
    },
    email: {
        type: String,
        required: [true, "email required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "password required"],
        minlength: [6, "Too short password"],
    },
    image: {
        type: String,
        default: 'defaultImage.jpeg'
   },
    phone: String,
    role: {
        type: String,
        enum: ["manager", "admin"],
        default: "manager",
        }
},
{ timestamps: true }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
    doc.image = imageUrl;
  }

};
// findOne, findAll and update
userSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
userSchema.post('save', (doc) => {
  setImageURL(doc);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
