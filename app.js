require("dotenv").config();
var _ = require("lodash")
var express = require("express");
var app = express();
// const cors = require("cors");
// const axios = require("axios"); 
// const morgan = require("morgan");
// const moment = require("moment");

const { User } = require("./models/user");


var db = require("./models/index");

app.use(express.json());
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

// app.use(moment());
app.use((req, res, next) => {
  // res.locals.moment = moment;
  next();
});
app.get("/", async (req, res) => {
  return res.send(`Welcome to darshanamAPI`)
});
// https://darshanam-api.herokuapp.com/create-token POST 
// {tokenName,tokenNum,poojaCharge,uname,gender,age,date,paymentMode,address}

app.post("/create-token",async (req,res) =>{
  try{
    const newtoken = ({
      tokenName,tokenNum,poojaCharge,name,gender,age,date,paymentMode,address
    } = req.body);
    let user = await User.create(newtoken)
    return res.status(200).json({message:`Successfully created token for ${name}`,data:user})
  }catch(e){
console.log(e)
return res.status(500).json({message:`Internal server error`})
  }
})
app.get("/report",async (req,res)=>{
  try{
    let data = await User.find({})
    var names =  _.uniq(_.map(data, 'tokenName'))
    var report = []
  async function namesFunction(names) {
    names.forEach(async(name)=>{
    let agg =  await User.aggregate([
        {
          $match:{tokenName:name}
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
        return res.status(200).json({message:`Successfully fetched`,data:data,report:report})
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