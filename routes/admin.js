const express = require('express');
const {
  getUser,createEmployee
} = require('../controllers/adminController');

const User = require('../models/user');

const router = express.Router({ mergeParams: true });



router
  .route('/:id')
  .get(getUser)
router.post('/create-employee',createEmployee)
module.exports = router;
