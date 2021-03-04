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
const reviewRouter = require("./reviews");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");
const queryByBootcampId = require("../middleware/queryByBootcampId");
const { protect, authorize, bootcampOwner } = require("../middleware/auth");

const router = express.Router();

// Re-route other resources
router.use("/:bootcampId/courses", queryByBootcampId, courseRouter);
router.use("/:bootcampId/reviews", queryByBootcampId, reviewRouter);

// Bootcamp routes
router
  .route("/")
  .get(
    advancedResults(
      Bootcamp,
      {
        path: "courses",
        select: "title"
      },
      {
        path: "user",
        select: "name"
      }
    ),
    getBootcamps
  )
  .post(protect, authorize("admin", "publisher"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, bootcampOwner, updateBootcamp)
  .delete(protect, bootcampOwner, deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(protect, bootcampOwner, bootcampPhotoUpload);

// Export routes
module.exports = router;
