const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

router.use(protect);
router.route('/profile').get(controller.getProfile).patch([
  body('name').optional().trim().isLength({ min: 2 }),
  body('bio').optional().trim().isLength({ max: 1500 }),
  body('skills').optional().trim().isLength({ max: 500 }),
  body('portfolio_url').optional({ values: 'falsy' }).isURL().withMessage('Portfolio must be a valid URL.'),
  body('profile_photo_url').optional({ values: 'falsy' }).isURL().withMessage('Profile photo must be a valid URL.')
], validate, controller.updateProfile);
module.exports = router;

