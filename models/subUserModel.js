const mongoose = require("mongoose");

const subUserSchema = new mongoose.Schema(
{
    name: {
        type: String,
        trim: true,
        required: [true, "name required"],
    },
},
{ timestamps: true }
);

const SubUser = mongoose.model("SubUser", subUserSchema);

module.exports = SubUser;