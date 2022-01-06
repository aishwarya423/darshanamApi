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
        required:true
      },
      tokenName:String,//poojaname
      tokenNum:String,//001
      poojaCharge:Number,
      gender:String,
      age:String,
      date:{type:Date,default:Date.now()},
      paymentMode:String,
      address:String,
      visitors:{type:Number,default:1}
  },
  { timestamps: true }
);

var User = mongoose.model("User", UserSchema);

exports.User = User;
