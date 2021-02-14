const express = require("express");
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius
} = require("../controllers/bootcamps");
const courseRouter = require("./courses");

const router = express.Router();

// Re-route other resources
router.use("/:bootcampId/courses", courseRouter);

// Bootcamp routes
router.route("/").get(getBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

// Export routes
module.exports = router;
