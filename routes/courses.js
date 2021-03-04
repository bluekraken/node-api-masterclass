const express = require("express");
const { getCourses, createCourse, getCourse, updateCourse, deleteCourse } = require("../controllers/courses");
const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");
const { protect, courseOwner } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Course routes
router
  .route("/")
  .get(
    advancedResults(
      Course,
      {
        path: "bootcamp",
        select: "name description"
      },
      {
        path: "user",
        select: "name"
      }
    ),
    getCourses
  )
  .post(protect, courseOwner, createCourse);

router.route("/:id").get(getCourse).put(protect, courseOwner, updateCourse).delete(protect, courseOwner, deleteCourse);

// Export routes
module.exports = router;
