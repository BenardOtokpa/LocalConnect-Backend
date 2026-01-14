const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Restaurant / Cafe",
        "Tours & Experiences",
        "Shopping & Artisan",
        "Wellness & Beauty",
        "Transport & Convenience",
        "Others",
      ],
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
