const mongoose = require("mongoose");

const staySchema = new mongoose.Schema(
  {
    guestUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },

    checkInAt: { type: Date, default: Date.now, index: true },
    checkOutAt: { type: Date },

    status: { type: String, enum: ["active", "checked_out", "cancelled"], default: "active", index: true }
  },
  { timestamps: true }
);

// one active stay per guest (MVP rule)
staySchema.index(
  { guestUserId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("Stay", staySchema);
