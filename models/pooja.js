const mongoose = require("mongoose");

var PoojaSchema = new mongoose.Schema(
  {
    name: {
    type: String,
    required: true,
    minlength: 1
    },
    charge:Number,
    color:String,
    poojaNum:{type:Number,default:1},
    totalCount:{type:Number,default:0}
  },
  { timestamps: true }
);

var Pooja = mongoose.model("Pooja", PoojaSchema);

exports.Pooja = Pooja;
