const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const message = err.code === 'ER_DUP_ENTRY' ? 'A record with that value already exists.' : err.message || 'Server error.';
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };

