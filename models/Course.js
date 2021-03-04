const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

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
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Please supply a user"]
    }
  },
  { timestamps: true }
);

// Static method to get average of course tuition fees
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuitionFee" }
      }
    }
  ]);

  const averageCost = obj.length ? obj[0].averageCost : 0;

  try {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(averageCost / 10) * 10
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
