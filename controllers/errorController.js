const { stack } = require('../app');
const appError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : 'Unknown';
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use Another value!`;
  return new appError(message, 400);
};

// Handle validation errors (schema validation)
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTErrorDB = () =>
  new appError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new appError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // API Errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered Website Errors
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //API
  // Operational, trusted errors: send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      console.log(err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //Programming errors ,unknown errors: don't leak error stack
    }
    //1)Log the error
    console.error('ERROR 💥', err);

    //2)Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something Went Wrong!',
    });
  }
  // B)RENDERED WEBSITE
  // Operational, trusted errors: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTErrorDB();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
