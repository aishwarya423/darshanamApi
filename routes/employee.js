const express = require('express');
const {
    createToken,
    report,
    reportType
} = require('../controllers/employeeController');

const User = require('../models/user');

const router = express.Router({ mergeParams: true });
const { protect,authorize } = require('../middleware/auth')

router
  .route('/create-token')
  .post(protect, authorize('employee','admin','mobileuser'), createToken);

router
  .route('/report')
  .get(protect ,report)

router
  .route('/report/:type')
  .get(protect,reportType)
module.exports = router;
