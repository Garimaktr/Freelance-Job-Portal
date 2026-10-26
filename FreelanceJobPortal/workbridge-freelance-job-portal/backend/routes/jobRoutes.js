const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/jobController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const jobValidation = [
  body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters.'),
  body('description').trim().isLength({ min: 30, max: 10000 }).withMessage('Description must be at least 30 characters.'),
  body('category_id').isInt({ min: 1 }),
  body('budget_min').isFloat({ min: 1 }),
  body('budget_max').isFloat({ min: 1 }).custom((value, { req }) => Number(value) >= Number(req.body.budget_min)).withMessage('Maximum budget must be at least the minimum.'),
  body('skills').trim().isLength({ min: 2, max: 500 }),
  body('experience_level').isIn(['entry', 'intermediate', 'expert']),
  body('deadline').optional({ values: 'falsy' }).isISO8601().toDate()
];

router.get('/featured', controller.featured);
router.get('/categories', controller.categories);
router.get('/mine', protect, allowRoles('client'), controller.clientJobs);
router.get('/', controller.listJobs);
router.post('/', protect, allowRoles('client'), jobValidation, validate, controller.createJob);
router.get('/:id', [param('id').isInt()], validate, controller.getJob);
router.patch('/:id', protect, allowRoles('client', 'admin'), [param('id').isInt()], validate, controller.updateJob);
router.delete('/:id', protect, allowRoles('client', 'admin'), [param('id').isInt()], validate, controller.deleteJob);
router.get('/:id/proposals', protect, allowRoles('client', 'admin'), [param('id').isInt()], validate, controller.getJobProposals);
router.post('/:id/proposals', protect, allowRoles('freelancer'), [
  param('id').isInt(), body('bid_amount').isFloat({ min: 1 }), body('cover_letter').trim().isLength({ min: 30, max: 5000 }), body('delivery_days').isInt({ min: 1, max: 365 })
], validate, controller.createProposal);
module.exports = router;

