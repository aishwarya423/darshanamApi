const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { Pooja } = require("../models/pooja");
const { User } = require("../models/user");
const _ = require('lodash')



// const Pooja = require('../models/pooja') 
exports.createToken = asyncHandler(async (req, res, next) => {
    console.log(req.user,"reqqq")
    req.body.empId = req.user._id
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
}); 

exports.report = asyncHandler(async (req, res, next) => {
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
      if(poojaSpecificDetails =[]) return res.status(200).json({message:`No report`,data:[]})
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
}); 

exports.reportType = asyncHandler(async (req, res, next) => {
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
     poojaSpecificDetails.forEach(async(i)=>{
       let pid = i.poojaId.toString()
       i.card  = await User.find({poojaId:pid,paymentMode:'card',createdAt:{$gt:fromDate}}).countDocuments()
       i.cash = await User.find({poojaId:pid,paymentMode:'cash',createdAt:{$gt:fromDate}}).countDocuments()
      i.upi = await User.find({poojaId:pid,paymentMode:'upi',createdAt:{$gt:fromDate}}).countDocuments()
      i.pooja = await Pooja.findOne({_id:pid},{_id:1,poojaNum:1})
       count++
       if(count == poojaSpecificDetails.length){
        poojaSpecificDetails = _.sortBy(poojaSpecificDetails,
          [function(o) { return o.pooja.poojaNum; }]);
        return res.status(200).json({message:`Successfully fetched`,data:poojaSpecificDetails})
       }
    })
}); 

