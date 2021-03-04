const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const Review = require("../models/Review");
const isValidObjectId = require("../utils/isValidObjectId");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorised for this route", 401));
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorised for this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role '${req.user.role}' is not authorised for this route`, 403));
    }

    if (req.baseUrl.includes("bootcamps")) {
      console.log("bootcamps");
    }

    next();
  };
};

// Validate the bootcamp owner
exports.bootcampOwner = asyncHandler(async (req, res, next) => {
  // Check that the bootcamp exists
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp id ${req.params.id} not found`, 404));
  }

  // Check that the user owns the bootcamp or is an admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User id ${req.user.id} is not authorised`, 401));
  }

  req.bootcamp = bootcamp;
  next();
});

// Validate the course owner
exports.courseOwner = asyncHandler(async (req, res, next) => {
  // Check that the course exists
  const course = await Course.findById(req.params.id);

  if (req.method !== "POST" && !course) {
    return next(new ErrorResponse(`Course id ${req.params.id} not found`, 404));
  }

  // Check that the bootcamp id is a valid Mongoose ObjectId
  const bootcampId = req.body.bootcamp ? req.body.bootcamp : course.bootcamp;

  if (!isValidObjectId(bootcampId)) {
    return next(new ErrorResponse(`Oops, ${bootcampId} is not a valid id`, 400));
  }

  // Check that the bootcamp exists
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp id ${req.body.bootcamp} not found`, 404));
  }

  // Check that the user owns the bootcamp or is an admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User id ${req.user.id} is not authorised`, 401));
  }

  req.course = course;
  next();
});

// Validate the review owner
exports.reviewOwner = asyncHandler(async (req, res, next) => {
  // Check that the review exists
  const review = await Review.findById(req.params.id);

  if (req.method !== "POST" && !review) {
    return next(new ErrorResponse(`Review id ${req.params.id} not found`, 404));
  }

  // Check that the user owns the review or is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User id ${req.user.id} is not authorised`, 401));
  }

  req.review = review;
  next();
});
