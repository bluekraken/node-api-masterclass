const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");
const sendEmail = require("../utils/sendEmail");

// @desc      Register a user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check to see if the email has already been registered
  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorResponse(`Sorry, but '${email}' has already been registered`, 400));
  }

  // Create the user
  user = await User.create({
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

// @desc      Forgot password
// @route     POST /api/v1/auth/reset-password
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Check that the email has been registered
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`Sorry, but '${req.body.email}' has not been registered`, 404));
  }

  // Get the reset password token
  const resetPasswordToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create the reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${resetPasswordToken}`;

  const message = `You are receiving this email because you (or someone else) has requested a password reset.  Please make a put request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset password request",
      message
    });

    res.status(200).json({ success: true, data: `Email sent to ${user.email}` });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/reset-password/:token
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  // Validate the token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Update the user
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Update the logged in user's details
// @route     PUT /api/v1/auth/update-details
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update the logged in user's password
// @route     PUT /api/v1/auth/update-password
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // Verify the user's current password
  const user = await User.findUserByCredentials(req.user.email, req.body.currentPassword);

  if (!user) {
    return next(new ErrorResponse("The current password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
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
