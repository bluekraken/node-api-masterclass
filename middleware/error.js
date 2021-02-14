const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error stack to the console
  console.log(err.kind);
  console.log(err.stack.red.bold);

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    const message = `Oops, ${err.value} is not a valid id`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose value is not unique
  if (err.code === 11000) {
    const message = `The value '${err.keyValue.name}' is not unique`;
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