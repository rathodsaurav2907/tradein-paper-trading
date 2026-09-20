const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === '23505') {
    return res.status(400).json({
      error: 'Duplicate entry'
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
