const mongoose = require("mongoose");

const codeCounterSchema = new mongoose.Schema(
  {
    prefix: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeCounter", codeCounterSchema);
