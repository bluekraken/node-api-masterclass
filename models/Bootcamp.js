const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please supply a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"]
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      required: [true, "Please supply a description"],
      maxlength: [500, "Description cannot be more than 500 characters"]
    },
    website: {
      type: String,
      validate(value) {
        if (!validator.isURL(value, { protocols: ["http", "https"] })) {
          throw new Error("Please supply a valid URL with http or https");
        }
      }
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot be longer than 20 characters"]
    },
    email: {
      type: String,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please supply a valid email");
        }
      }
    },
    address: {
      type: String,
      required: [true, "Please supply an address"]
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: [true, "Please supply at least one career"],
      enum: ["Web Development", "Mobile Development", "UI/UX", "Data Science", "Business", "Other"]
    },
    averageRating: {
      type: Number,
      min: [0, "Rating must be at least 0"],
      max: [10, "Rating can not be more than 10"]
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg"
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Please supply a user"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create a bootcamp slug from the name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create the location fields
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save the address
  this.address = undefined;

  next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false
});

const Bootcamp = mongoose.model("Bootcamp", BootcampSchema);

module.exports = Bootcamp;
