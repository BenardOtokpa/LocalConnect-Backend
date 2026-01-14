const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    hotelName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    locationText: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
      index: true,
    },

    peakDays: {
      type: [String],
      default: [],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Luxury & Lifestyle",
        "Business & Conference",
        "Boutique & Art",
        "Extended Stay & Suites",
        "Resort & Leisure",
        "Others",
      ],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
