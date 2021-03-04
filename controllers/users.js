const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Create a new user
// @route     POST /api/v1/users
// @access    Private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc      Get a single user
// @route     GET /api/v1/users/:id
// @access    Private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User id ${req.params.id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update a user
// @route     PUT /api/v1/users/:id
// @access    Private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User id ${req.params.id} not found`, 404));
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Delete a user
// @route     DELETE /api/v1/users/:id
// @access    Private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User id ${req.params.id} not found`, 404));
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
