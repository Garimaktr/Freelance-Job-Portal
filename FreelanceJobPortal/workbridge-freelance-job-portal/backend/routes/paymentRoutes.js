const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/paymentController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
router.use(protect);
router.get('/', controller.listPayments);
router.post('/', allowRoles('client'), [body('job_id').isInt(), body('proposal_id').isInt(), body('amount').isFloat({ min: 1 })], validate, controller.createPayment);
router.patch('/:id/status', [param('id').isInt(), body('status').isIn(['pending', 'escrow_held', 'released'])], validate, controller.updateStatus);
module.exports = router;

