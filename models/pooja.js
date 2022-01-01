const mongoose = require("mongoose");

var PoojaSchema = new mongoose.Schema(
  {
      name: {
      type: String,
      required: true,
      minlength: 1
      },
      charge:Number,
      poojaNum:{type:Number,default:1}
  },
  { timestamps: true }
);

var Pooja = mongoose.model("Pooja", PoojaSchema);

exports.Pooja = Pooja;
