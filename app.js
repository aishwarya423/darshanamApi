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
app.use(errorHandler);

//Get all pooja details
app.get("/", async (req, res) => {
let poojas = await Pooja.find({})
  return res.status(200).json({message:"Welcome to darshanamAPI",data:poojas})
});

app.get("/pooja-details/:id",async (req,res) =>{
  try{
    let pooja = await Pooja.findById(req.params.id)
    return res.status(200).json({message:`Done`,data:pooja})
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})
app.post("/pooja/create",async (req,res) =>{
  try{
    req.body.poojaNum = await Pooja.find({}).count() + 1 || 1
    const newpooja = ({name,charge} = req.body);
    let pooja = await Pooja.create(newpooja)
    return res.status(200).json({message:`Successfully added ${name} in poojs list`,data:pooja})
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})
//for editing pooja
app.post("/pooja/edit/:id",async (req,res) =>{
  try{
    let { name,charge ,poojaNum} = req.body;
    const data = await Pooja.findOneAndUpdate(
      { _id: req.params.id },
      {name,charge,poojaNum},
      { returnOriginal: false }
    );
    console.log(data);
    return res.status(200).json({ message: "Pooja Successfully updated", response: data });
  } catch(e){
    console.log(e)
    return res.status(404).json({ message: "Try again later", response: data });
  }
})

app.post("/pooja/delete/:id",async (req,res) =>{
  try{
     await Pooja.findOneAndRemove();
    return res.status(200).json({ message: "Pooja Removed Successfully"});
  } catch(e){
    console.log(e)
    return res.status(404).json({ message: "Try again later", response: data });
  }
})

app.post("/create-token",async (req,res) =>{
  try{
    var pooja = await Pooja.findById(req.body.poojaId)
    req.body.tokenName = pooja.name
    req.body.tokenNum = pooja.poojaNum + '-' + (pooja.totalCount + 1)
    req.body.poojaCharge = pooja.charge
    const newtoken = ({tokenName,tokenNum,poojaCharge,
      name,gender//
      ,age//
      ,date,paymentMode
      ,address,//
      poojaId,visitors  //need to be sent by frontend
    } = req.body);
    let user = await User.create(newtoken)
    pooja.totalCount += 1
    pooja.save()
    return res.status(200).json({message:`Successfully created token for ${name}`,data:user})
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
     poojaSpecificDetails.forEach(async(i)=>{
       let pid = i.poojaId.toString()
       i.card  = await User.find({poojaId:pid,paymentMode:'card'}).countDocuments()
       i.cash = await User.find({poojaId:pid,paymentMode:'cash'}).countDocuments()
      i.upi = await User.find({poojaId:pid,paymentMode:'upi'}).countDocuments()
      i.pooja = await Pooja.findOne({_id:pid},{_id:1,poojaNum:1})
       count++
       if(count == poojaSpecificDetails.length){
        poojaSpecificDetails = _.sortBy(poojaSpecificDetails, 
          [function(o) { return o.pooja.poojaNum; }]);
        return res.status(200).json({message:`Successfully fetched`,data:poojaSpecificDetails})
       }
    })
    
  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})


app.get("/reportold",async (req,res)=>{
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

    let poojaSpecificDetails1 = await User.aggregate([
      {
        $group:{
        _id:{poojaId:"$poojaId" ,paymentMode :"$paymentMode" },
        poojaId: {$first:"$poojaId"},
        poojaName: {$first:"$tokenName"},
        paymentMode: {$first:"$paymentMode"},
        tokenSum:{$sum:1},
      }
      }
    ])
    // console.log(poojaSpecificDetails1,poojaSpecificDetails1.length,"poojaSpecificDetails1")
    poojaSpecificDetails.forEach(i=>{
      poojaSpecificDetails1.forEach(j=>{
        console.log(i._id.poojaId , j._id.poojaId ,i._id.poojaId.toString() == j._id.poojaId.toString())
      if(i._id.poojaId.toString() == j._id.poojaId.toString()){
        i[j.paymentMode] = j.tokenSum
      } else{
        i[j.paymentMode] = 0
      }
      })
    })
    return res.status(200).json({message:`Successfully fetched`,data:poojaSpecificDetails})

  }catch(e){
    console.log(e)
    return res.status(500).json({message:`Internal server error`})
  }
})

app.all('*', (req, res) =>{
  return res.send('Page not found');
});


app.listen(process.env.PORT || 3000, () => console.log(`Hello to ${process.env.PORT}`));

//"tokenName":"token1","tokenNum":"02","poojaCharge":"200","name":"Aish","gender":"F","age":"22","paymentMode":"cash","address":"hyd"


// 
// // To fetch all pooja details
// GET https://darshanam-api.herokuapp.com/ 

// //To fetch single pooja details
// GET https://darshanam-api.herokuapp.com/pooja-details/:id

// //To create pooja
// POST https://darshanam-api.herokuapp.com/pooja/create {name,charge}

// POST https://darshanam-api.herokuapp.com/pooja/edit/:id{ name,charge ,poojaNum}

// POST https://darshanam-api.herokuapp.com/pooja/delete/:id

// POST https://darshanam-api.herokuapp.com/create-token POST
// // {poojaID(it will be object id which i sent you in list of poojas),poojaCharge,name,gender,age,date,paymentMode,address}

// GET https://darshanam-api.herokuapp.com/report