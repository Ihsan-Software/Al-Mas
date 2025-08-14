const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{    
    userInfoID: {
      type: mongoose.Schema.ObjectId,
      ref: 'UserInfo',
      required: [true, "User Info ID required"],
    },
    name: {
        type: String,
        trim: true,
        required: [true, "name required"],
    },
    temporarilyDeleted:{
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

// Mongoose query middleware
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userInfoID',
     select: '-createdAt -updatedAt -__v'
  });
  next();
});


const User = mongoose.model("User", userSchema);

module.exports = User;
