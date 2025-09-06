const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema(
{
    isRunning:{
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
);


const System = mongoose.model("System", systemSchema);

module.exports = System;
