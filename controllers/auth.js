const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Register a user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create the user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 201, res);
});

// @desc      Login a user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and a password", 400));
  }

  // Verify user
  const user = await User.findUserByCredentials(email, password);

  if (!user) {
    return next(new ErrorResponse("Invalid login", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get the logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// Create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();

  const secure = process.env.NODE_ENV === "production" ? true : false;

  const options = {
    httpOnly: true,
    secure
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token
  });
};
