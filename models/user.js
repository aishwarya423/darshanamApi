const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
      name: {
      type: String,
      required: true,
      minlength: 1
      },
      tokenName:String,
      tokenNum:String,
      poojaCharge:String,
      name:String,
      gender:String,
      age:String,
      date:Date,
      paymentMode:String,
      address:String
  },
  { timestamps: true }
);

var User = mongoose.model("User", UserSchema);

exports.User = User;
