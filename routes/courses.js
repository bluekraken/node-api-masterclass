const express = require("express");
const { getCourses, createCourse, getCourse } = require("../controllers/courses");

const router = express.Router({ mergeParams: true });

// Course routes
router.route("/").get(getCourses).post(createCourse);

router.route("/:id").get(getCourse);

// Export routes
module.exports = router;
