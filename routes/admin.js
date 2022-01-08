const express = require('express');
const {
  createEmp,
getEmp,
updateEmp,
deleteEmp,
createPooja,updatePooja,deletePooja,getEmps
} = require('../controllers/adminController');


const router = express.Router({ mergeParams: true });

const { protect,authorize } = require('../middleware/auth')
router.use(protect)
router.use(authorize('admin'))

router
  .route('/create-employee')
  .post(createEmp);

router
  .route('/emp/:id')
  .get(getEmp)
  .put(updateEmp)
  .delete(deleteEmp);

router
  .route('/create-pooja')
  .post(createPooja);


router
  .route('/pooja/:id')
  .put(updatePooja)
  .delete(deletePooja);

router
  .route('/emps')
  .get(getEmps)
module.exports = router;
