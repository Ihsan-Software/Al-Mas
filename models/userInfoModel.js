const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userInfoSchema = new mongoose.Schema(
{
    email: {
        type: String,
        required: [true, "email required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "password required"],
        minlength: [8, "Too short password"],
    },
    image: {
        type: String,
        required: [true, "image required"]
   },
    phone: String,
    role: {
        type: String,
        enum: ["manager", "employee"],
        default: "employee",
    }
},
{ timestamps: true }
);


userInfoSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const setImageURL = (doc) => {
    if (doc.image && !doc.image.includes(`${process.env.BASE_URL}`)) {
        const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll and update
userInfoSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
userInfoSchema.post('save', (doc) => {
  setImageURL(doc);
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

module.exports = UserInfo;