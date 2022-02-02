require("dotenv").config();
var _ = require("lodash")
var express = require("express");
var app = express();
const cors = require("cors");
const axios = require("axios"); 
// const morgan = require("morgan");
// const moment = require("moment");

const { User } = require("./models/user");
const { Pooja } = require("./models/pooja");
const errorHandler = require('./middleware/error');

var db = require("./models/index");
const res = require("express/lib/response");
const { ObjectID } = require("mongodb");

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));
// app.use(moment());
app.use((req, res, next) => {
  // res.locals.moment = moment;
  next();
});


var whitelist = ['http://localhost:3000', 'http://example2.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || true) {
      console.log("inn")
      callback(null, true)
    } else {
      console.log("in else")
      // callback(new Error('Not allowed by CORS'))
      return res.send("Sorry page not found")
    }
  }
}
// app.use(cors());
app.use(cors(corsOptions));

app.use('/admin',adminRoutes)
app.use('/auth',authRoutes)
app.use('/emp',employeeRoutes)

app.use(errorHandler);

const { protect } = require('./middleware/auth');

//Get all pooja details
app.get("/", async (req, res) => {
let poojas = await Pooja.find({})
  return res.status(200).json({message:"Welcome to darshanamAPI",data:poojas})
});


app.get("/ticket-details/:id",async (req,res) =>{
  try{
    let pooja = await User.findById(req.params.id).populate('poojaId')
    return res.status(200).json({message:`Done`,data:pooja})
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})

app.get("/all-ticket-details",async (req,res) =>{
  try{
    let pooja = await User.find().populate('poojaId')
    return res.status(200).json({message:`Done`,data:pooja})
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})
app.get("/pooja-details/:id",async (req,res) =>{
  try{
    let pooja = await Pooja.findById(req.params.id)
    return res.status(200).json({message:`Done`,data:pooja})
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})

app.get("/report",async (req,res)=>{
  try{
    let poojaSpecificDetails = await User.aggregate([
      {
        $group:{
        _id:{poojaId:"$poojaId"},
        poojaId: {$first:"$poojaId"},
        poojaName: {$first:"$tokenName"},
        tokenSum:{$sum:1},
        chargeSum : { $sum : "$poojaCharge"}
      }
    }
    ])
    let count = 0
    let  totalGross = 0
     poojaSpecificDetails.forEach(async(i)=>{
       let pid = i.poojaId.toString()
       i.card  = await User.find({poojaId:pid,paymentMode:'card'}).countDocuments()
       i.cash = await User.find({poojaId:pid,paymentMode:'cash'}).countDocuments()
      i.upi = await User.find({poojaId:pid,paymentMode:'upi'}).countDocuments()
      i.pooja = await Pooja.findOne({_id:pid},{_id:1,poojaNum:1})
       count++
       totalGross += i.chargeSum
       if(count == poojaSpecificDetails.length){
        poojaSpecificDetails = _.sortBy(poojaSpecificDetails, 
          [function(o) { return o.pooja.poojaNum; }]);
        return res.status(200).json({message:`Successfully fetched`,data:poojaSpecificDetails ,totalGross:totalGross})
       }
    })
    
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})

app.get("/report/:type",async (req,res)=>{
  try{
    const today = new Date();
    let yesterday, fromDate
    if(req.params.type == 'day'){
       yesterday = today.setDate(today.getDate()-1);
    }else if(req.params.type== 'week'){
       yesterday = today.setDate(today.getDate()-7);
    } else if(req.params.type =='month'){
      yesterday = today.setDate(today.getMonth()-1);
    }
    fromDate = new Date(yesterday)
    // console.log(fromDate,"n",yesterday,today.setDate(today.getDate()-7))
    let poojaSpecificDetails = await User.aggregate([
      {$match:{createdAt:{$gt:fromDate}} },
      {
        $group:{
        _id:{poojaId:"$poojaId"},
        poojaId: {$first:"$poojaId"},
        poojaName: {$first:"$tokenName"},
        tokenSum:{$sum:1},
        chargeSum : { $sum : "$poojaCharge"}
      }
    }
    ])
    let count = 0
   let totalGross = 0
     poojaSpecificDetails.forEach(async(i)=>{
       let pid = i.poojaId.toString()
       i.card  = await User.find({poojaId:pid,paymentMode:'card',createdAt:{$gt:fromDate}}).countDocuments()
       i.cash = await User.find({poojaId:pid,paymentMode:'cash',createdAt:{$gt:fromDate}}).countDocuments()
      i.upi = await User.find({poojaId:pid,paymentMode:'upi',createdAt:{$gt:fromDate}}).countDocuments()
      i.pooja = await Pooja.findOne({_id:pid},{_id:1,poojaNum:1})
       count++
       totalGross += i.chargeSum
       if(count == poojaSpecificDetails.length){
        poojaSpecificDetails = _.sortBy(poojaSpecificDetails,
          [function(o) { return o.pooja.poojaNum; }]);
        return res.status(200).json({message:`Successfully fetched`,data:poojaSpecificDetails ,totalGross:totalGross})
       }
    })
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})


app.all('*', (req, res) =>{
  return res.send('Page not found');
});


app.listen(process.env.PORT || 3000, () => console.log(`Hello to ${process.env.PORT}`));
