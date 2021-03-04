const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");
const isValidObjectId = require("../utils/isValidObjectId");

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
exports.getReviews = asyncHandler((req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Create a new review
// @route     POST /api/v1/reviews
// @access    Private
exports.createReview = asyncHandler(async (req, res, next) => {
  // Check that the bootcamp id is a valid Mongoose ObjectId
  const bootcampId = req.body.bootcamp;

  if (!isValidObjectId(bootcampId)) {
    return next(new ErrorResponse(`Oops, ${bootcampId} is not a valid id`, 400));
  }

  // Check that the bootcamp exists
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp id ${req.body.bootcamp} not found`, 404));
  }

  req.body.user = req.user._id;
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc      Get a single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: "bootcamp",
      select: "name description"
    })
    .populate({
      path: "user",
      select: "name"
    });

  if (!review) {
    return next(new ErrorResponse(`Review id ${req.params.id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Update a review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  // Cannot update the bootcamp
  const bootcampId = req.body.bootcamp;

  if (bootcampId) {
    return next(new ErrorResponse("The bootcamp cannot be changed", 403));
  }

  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Delete a review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  await req.review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
