const mongoose = require("mongoose");

const stayAccessCodeSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    guestUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }, // set after guest registers/logs in
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: "Stay", index: true },

    // IMPORTANT: store hash, not the raw code
    codeHash: { type: String, required: true, select: false },

    // helps debugging/display without revealing full code
    codeLabel: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    }, // e.g. "EHL-094"

    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
      index: true,
    },

    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, index: true }, // set to checkout time or planned checkout
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

// Ensure codeLabel unique (prevents duplicates)
stayAccessCodeSchema.index({ codeLabel: 1 }, { unique: true });

module.exports = mongoose.model("StayAccessCode", stayAccessCodeSchema);
