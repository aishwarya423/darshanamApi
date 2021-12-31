require("dotenv").config();
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
  return res.send(`Welcome darshanamAPI`)
});

app.post("/create-token",async (req,res) =>{
  try{
    const newtoken = ({
      tokenName,tokenNum,poojaCharge,uname,gender,age,date,paymentMode,address
    } = req.body);
    let user = await User.create(newtoken)
    return res.status(200).json({message:`Successfully created token for ${uname}`,data:user})
  }catch(e){
console.log(e)
return res.status(500).json({message:`Internal server error`})
  }
})
// app.get("/darshan-details/:id")
app.all('*', (req, res) =>{
  return res.send('Page not found');
});


app.listen(process.env.PORT || 3000, () => console.log(`Hello to ${process.env.PORT}`));