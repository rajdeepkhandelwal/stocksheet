// var express = require("express");
var mongoose = require("mongoose");
var carSchema = new mongoose.Schema({
    
    regNo   :String,
    carName :String,
    company:String,
    cost    :Number,
    kms     :Number,
    location:String,
    insurance:String,
    status:String,
    // dateadded:Date,
//    timeadded: Timestamp
    
});

module.exports=mongoose.model("Car",carSchema);