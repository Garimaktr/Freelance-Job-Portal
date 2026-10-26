const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

router.post('/register', [body('name').trim().isLength({ min: 2 }).withMessage('Name must have at least 2 characters.'), body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'), body('password').isLength({ min: 8 }).withMessage('Password must have at least 8 characters.'), body('role').isIn(['client', 'freelancer']).withMessage('Choose Client or Freelancer.')], validate, controller.register);
router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty().withMessage('Password is required.')], validate, controller.login);
router.get('/me', protect, controller.me);
module.exports = router;

