const express = require("express");
const { getCourses, createCourse, getCourse, updateCourse, deleteCourse } = require("../controllers/courses");
const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

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
  .post(createCourse);

router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

// Export routes
module.exports = router;
