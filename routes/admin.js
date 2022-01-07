const express = require('express');
const {
  getUser,createEmployee
} = require('../controllers/adminController');

const User = require('../models/user');

const router = express.Router({ mergeParams: true });
const { protect,authorize } = require('../middleware/auth')

router
  .route('/create-employee')
  .post(protect, authorize('admin'), createEmployee);

router
  .route('/:id')
  .get(getUser)
module.exports = router;
