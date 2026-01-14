const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    businessEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    contactPhone: { type: String, required: true, trim: true, index: true },
    location: {
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

    // Auth support: password OR google
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      index: true,
    },
    passwordHash: { type: String },
    googleSub: { type: String, unique: true, sparse: true, index: true },

    termsAccepted: { type: Boolean, required: true },
    termsAcceptedAt: { type: Date, required: true },
    termsVersion: { type: String, default: "v1.0" },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// enforce auth rules
hotelSchema.pre("validate", function (next) {
  if (this.authProvider === "local" && !this.passwordHash)
    return next(
      new ApiError(400, "Password is required for email/password accounts")
    );
  if (this.authProvider === "google" && !this.googleSub)
    return next(
      new ApiError(400, "Google account ID is required for Google sign-in")
    );
  next();
});
hotelSchema.pre("save", function (next) {
  if (this.authProvider === "local" && this.isModified("passwordHash"))
    this.termsAccepted = true;
  next();
});
hotelSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};
hotelSchema.methods.verifyPassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("Hotel", hotelSchema);
