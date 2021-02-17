const Course = require("../models/Course");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");
const isValidObjectId = require("../utils/isValidObjectId");

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler((req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Create a new course
// @route     POST /api/v1/courses
// @access    Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Check whether the bootcampId is a valid Mongoose ObjectId
  if (!isValidObjectId(req.body.bootcamp)) {
    return next(new ErrorResponse(`Oops, ${req.body.bootcamp} is not a valid id`, 400));
  }

  const course = await Course.create(req.body);
  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc      Get a single course
// @route     GET /api/v1/course/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id = ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc      Update a course
// @route     PUT /api/v1/course/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  // Check whether the bootcampId is a valid Mongoose ObjectId
  if (req.body.bootcamp && !isValidObjectId(req.body.bootcamp)) {
    return next(new ErrorResponse(`Oops, ${req.body.bootcamp} is not a valid id`, 400));
  }

  // Check the course exists
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id = ${req.params.id}`, 404));
  }

  // Apply the updates
  const updates = Object.keys(req.body);
  updates.forEach((update) => (course[update] = req.body[update]));
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc      Delete a course
// @route     DELETE /api/v1/course/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  // Check the course exists
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id = ${req.params.id}`, 404));
  }

  // Delete the course
  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
