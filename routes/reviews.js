const express = require("express");
const { getReviews, createReview, getReview, updateReview, deleteReview } = require("../controllers/reviews");
const Review = require("../models/Review");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize, reviewOwner } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

// Course routes
router
  .route("/")
  .get(
    advancedResults(
      Review,
      {
        path: "bootcamp",
        select: "name description"
      },
      {
        path: "user",
        select: "name"
      }
    ),
    getReviews
  )
  .post(protect, authorize("admin", "user"), createReview);

router.route("/:id").get(getReview).put(protect, reviewOwner, updateReview).delete(protect, reviewOwner, deleteReview);

// Export routes
module.exports = router;
