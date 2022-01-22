const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
      name: {
      type: String,
      required: true,
      minlength: 1
      },
      poojaId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pooja",
        required:true,
        immutable: true
      },
      empId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required:true,
        immutable: true
      },
      tokenName:{type:String,immutable: true},//poojaname
      tokenNum:{type:String,immutable: true},//001
      poojaCharge:Number,
      gender:String,
      age:String,
      date:{type:Date,default:Date.now()},
      paymentMode:String,
      address:String,
      phone:String,
      visitors:{type:Number,default:1}
  },
  { timestamps: true }
);

var User = mongoose.model("User", UserSchema);

exports.User = User;
