module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  return res.status(status).json({ message });
};
