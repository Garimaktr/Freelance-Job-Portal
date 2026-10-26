const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
router.use(protect, allowRoles('admin'));
router.get('/dashboard', controller.dashboard);
router.get('/users', controller.users);
router.patch('/users/:id/status', [param('id').isInt(), body('is_active').isBoolean()], validate, controller.setUserActive);
router.get('/jobs', controller.allJobs);
module.exports = router;

