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
  .post(protect, authorize('employee','admin'), createToken);

router
  .route('/report')
  .get(report)

router
  .route('/report/:type')
  .get(reportType)
module.exports = router;
