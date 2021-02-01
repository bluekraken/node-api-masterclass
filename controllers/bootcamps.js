const Bootcamp = require("../models/Bootcamp");

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
};

// @desc      Create a new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
};

// @desc      Get a bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        error: "Bootcamp not found!"
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
};

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamp/:id
// @access    Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        error: "Bootcamp not found!"
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
};

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamp/:id
// @access    Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        error: "Bootcamp not found!"
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
};