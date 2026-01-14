const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "LOCAL";
      },
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["HOTEL", "BUSINESS", "GUEST"],
      required: true,
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    termsAcceptance: {
      accepted: {
        type: Boolean,
        required: true,
      },
      acceptedAt: {
        type: Date,
        default: Date.now,
      },
      version: {
        type: String,
        default: "1.0",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
