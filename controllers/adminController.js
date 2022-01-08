
require("dotenv").config();
var _ = require("lodash")

const { User } = require("../models/user");
const Employee = require('../models/employee');
const { Pooja } = require("../models/pooja");
// const errorHandler = require('./middleware/error');

const { ObjectID } = require("mongodb");
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.createEmp = asyncHandler(async (req, res, next) => {
    const user = await Employee.create(req.body);
    res.status(201).json({ success: true, data: user });
  }); 
exports.getEmp = asyncHandler(async (req, res, next) => {
    const user = await Employee.findById(req.params.id);
     if (!user) {
      return next(
        new ErrorResponse(`No token with the id of ${req.params.id}`),
        404
      );
    }
    res.status(200).json({
      success: true,
      data: user
    });
});
exports.getEmps = asyncHandler(async (req, res, next) => {
  const user = await Employee.find({});
   if (user== []) {
    return next(
      new ErrorResponse(`No Employees`),
      404
    );
  }
  res.status(200).json({
    success: true,
    data: user
  });
});

exports.updateEmp = asyncHandler(async (req, res, next) => {
  const user = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

exports.deleteEmp = asyncHandler(async (req, res, next) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});
//--Pooja

exports.createPooja = asyncHandler(async (req, res, next) => {
  req.body.poojaNum = await Pooja.find({}).count() + 1 || 1
  const user = await Pooja.create(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.updatePooja = asyncHandler(async (req, res, next) => {
  const user = await Pooja.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: user
  });
});

exports.deletePooja = asyncHandler(async (req, res, next) => {
  await Pooja.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});
