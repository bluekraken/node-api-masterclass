const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");
const geocoder = require("../utils/geocoder");

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Copy request query
  const reqQuery = { ...req.query };

  // Remove parameters from query
  const removeParams = ["select", "sort", "page", "limit"];
  removeParams.forEach((param) => delete reqQuery[param]);

  // Create query object
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\blt|lte|gt|gte|ne|in\b/g, (match) => `$${match}`);
  let queryObj = JSON.parse(queryStr);

  // Convert string values with '%' into regexs
  // Mongoose uses a regex for a like comparison
  // E.g. /name/ rather than %name%
  Object.keys(queryObj).forEach((key) => {
    let value = queryObj[key];
    if (typeof value === "string" && value.includes("%")) {
      value = value.replace(/%/g, "");
      queryObj[key] = new RegExp(value);
    }
  });

  // Allocate resource
  let query = Bootcamp.find(queryObj).populate("courses");

  // Select fields to return
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort documents
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocs = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  pagination.pages = Math.floor((totalDocs - 1) / limit) + 1;

  if (endIndex < totalDocs) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  // Response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

// @desc      Create a new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Get a single bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id = ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamp/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id = ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamp/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id = ${req.params.id}`, 404));
  }

  await bootcamp.remove();

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  // Calculate radius in radians
  // Divide distance by radius of earth (6,378 km)
  const radius = distance / 6_378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
