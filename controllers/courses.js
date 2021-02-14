const Course = require("../models/Course");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  console.log(req.params.bootcampId);

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description"
    });
  }

  const courses = await query;

  // Response
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc      Create a new course
// @route     POST /api/v1/courses
// @access    Private
exports.createCourse = asyncHandler(async (req, res, next) => {
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
