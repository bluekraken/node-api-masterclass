const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please supply a review title"],
      maxlength: 100
    },
    review: {
      type: String,
      trim: true,
      required: [true, "Please supply a review"]
    },
    rating: {
      type: Number,
      min: [1, "Please supply a rating between 1 and 10"],
      max: [10, "Please supply a rating between 1 and 10"],
      required: [true, "Please supply a rating between 1 and 10"]
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: [true, "Please supply a bootcamp"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Please supply a user"]
    }
  },
  { timestamps: true }
);

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const averageRating = obj.length ? obj[0].averageRating : 0;

  try {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageRating
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
