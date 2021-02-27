const express = require("express");
const { getCourses, createCourse, getCourse, updateCourse, deleteCourse } = require("../controllers/courses");
const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Course routes
router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description"
    }),
    getCourses
  )
  .post(protect, authorize("admin", "publisher"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("admin", "publisher"), updateCourse)
  .delete(protect, authorize("admin", "publisher"), deleteCourse);

// Export routes
module.exports = router;
