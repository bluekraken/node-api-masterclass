const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");
const ErrorResponse = require("../utils/ErrorResponse");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please supply a course title"]
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please supply a description"]
    },
    weeks: {
      type: String,
      trim: true,
      required: [true, "Please supply number of weeks"]
    },
    tuitionFee: {
      type: Number,
      required: [true, "Please supply a tuition fee"],
      min: [0, "Minimum tuition fee is zero"]
    },
    minimumSkill: {
      type: String,
      required: [true, "Please supply a minimum skill"],
      enum: ["beginner", "intermediate", "advanced"]
    },
    scholarshipsAvailable: {
      type: Boolean,
      default: false
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: [true, "Please supply a bootcamp"]
    }
  },
  { timestamps: true }
);

// Validate that the bootcamp exists
CourseSchema.pre("save", async function (next) {
  const bootcamp = await Bootcamp.findById(this.bootcamp);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id = ${this.bootcamp}`, 404));
  }

  next();
});

module.exports = mongoose.model("Course", CourseSchema);
