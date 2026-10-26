const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/proposalController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
router.use(protect);
router.get('/mine', allowRoles('freelancer'), controller.myProposals);
router.patch('/:id', allowRoles('freelancer'), [param('id').isInt(), body('bid_amount').optional().isFloat({ min: 1 }), body('cover_letter').optional().trim().isLength({ min: 30 }), body('delivery_days').optional().isInt({ min: 1 })], validate, controller.updateProposal);
router.delete('/:id', allowRoles('freelancer'), [param('id').isInt()], validate, controller.deleteProposal);
router.patch('/:id/status', allowRoles('client', 'admin'), [param('id').isInt(), body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected.')], validate, controller.setStatus);
module.exports = router;

