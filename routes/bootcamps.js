const express = require("express");
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");
const courseRouter = require("./courses");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");
const queryByBootcampId = require("../middleware/queryByBootcampId");

const router = express.Router();

// Re-route other resources
router.use("/:bootcampId/courses", queryByBootcampId, courseRouter);

// Bootcamp routes
router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(bootcampPhotoUpload);

// Export routes
module.exports = router;
