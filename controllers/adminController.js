
require("dotenv").config();
var _ = require("lodash")

const { User } = require("../models/user");
const { Pooja } = require("../models/pooja");
// const errorHandler = require('./middleware/error');

const { ObjectID } = require("mongodb");
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Emp = require('../models/employee');

exports.createEmployee = asyncHandler(async (req, res, next) => {
    const user = await Emp.create(req.body);
 
    res.status(201).json({
      success: true,
      data: user
    });
  }); 
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
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

