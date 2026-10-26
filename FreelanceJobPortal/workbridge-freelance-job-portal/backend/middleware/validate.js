const { validationResult } = require('express-validator');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array().map((item) => item.msg).join(' '));
    error.statusCode = 422;
    return next(error);
  }
  next();
};

