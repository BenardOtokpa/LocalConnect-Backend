const mongoose = require("mongoose");

const checkInCodeSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    seq: { type: Number, required: true },

    status: {
      type: String,
      enum: ["issued", "used", "expired"],
      default: "issued",
      index: true,
    },

    issuedAt: { type: Date, default: Date.now },
    usedAt: { type: Date },

    // optional: make codes expire (recommended)
    expiresAt: { type: Date, index: true },

    // optional: store email the hotel issued this code for
    intendedEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

checkInCodeSchema.index({ hotel: 1, seq: 1 }, { unique: true });

module.exports = mongoose.model("CheckInCode", checkInCodeSchema);
