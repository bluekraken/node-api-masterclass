const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error stack to the console
  console.log(err.stack.red.bold);

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose value is not unique
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue);
    // const message = `The ${keys[0]} '${err.keyValue[keys[0]]}' is not unique`;
    const message = "Duplicate key error";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error"
  });
};

module.exports = errorHandler;
