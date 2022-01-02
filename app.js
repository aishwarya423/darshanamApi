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
var db = require("./models/index");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));
// app.use(moment());
app.use((req, res, next) => {
  // res.locals.moment = moment;
  next();
});

//Get all pooja details
app.get("/", async (req, res) => {
let poojas = await Pooja.find({})
  return res.status(200).json({message:"Welcome to darshanamAPI",data:poojas})
});
//find single pooja
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
      name,gender,age,date,paymentMode,address,poojaId//need to be sent by frontend
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

    let poojaspecificChargesSum = await User.aggregate([
      {
        $group:{
        _id:{tokenName:"$tokenName"},
        count:{$sum:1},
        totPoojaCharge : { $sum : "$poojaCharge"}
      }
      }
    ])
    //---------------
    var names = await Pooja.find({},{name:1,_id:0})
    var report = []
  async function namesFunction(names) {
    names.forEach(async(name)=>{
    let agg =  await User.aggregate([
        {
          $match:{tokenName:name.name}
        },
        {
          $group:{
            _id:  { paymentMode : "$paymentMode" }, // Group By Expression
            count: { $sum : 1 },
            ticketName:{$first:"$tokenName"},
            totPoojaCharge : { $sum : "$poojaCharge"}
          }
        }
      ])
      report.push(agg)
      // console.log(report,"report",report.length,"is rep ength")
      // console.log(agg)
      if(report.length == names.length){
        return res.status(200).json({message:`Successfully fetched`,report:report,poojaspecificChargesSum:poojaspecificChargesSum})
      }
    })
  }
  await namesFunction(names)
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



