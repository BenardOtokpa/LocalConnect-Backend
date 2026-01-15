const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/UserModel");
const Hotel = require("../models/HotelModel");
const Business = require("../models/BusinessModel");

const generateToken = require("../utils/generateToken");
const makePrefix = require("../utils/makeHotelPrefix"); // ensure this file exists + returns a function

// 1) Register Hotel (transaction: prevents orphan User if Hotel save fails)
async function registerHotel(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      hotelName,
      email,
      contactPhone,
      locationText,
      peakDays,
      category,
      password,
      confirmPassword,
      acceptedTerms,
    } = req.body;

    // Basic validation
    if (
      !hotelName ||
      !email ||
      !contactPhone ||
      !locationText ||
      !category ||
      !password ||
      !confirmPassword
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (password !== confirmPassword) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!acceptedTerms) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "You must accept the Terms and Privacy Policy" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({ email: emailNorm }).session(
      session
    );
    if (existingUser) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User (in session)
    const createdUsers = await User.create(
      [
        {
          name: hotelName,
          email: emailNorm,
          password: hashedPassword,
          role: "HOTEL",
          authProvider: "LOCAL",
          termsAcceptance: {
            accepted: true,
            acceptedAt: new Date(),
            version: "v1.0",
          },
        },
      ],
      { session }
    );

    const user = createdUsers[0];

    // Create Hotel Profile (in session)
    const codePrefix = makePrefix(hotelName);

    const createdHotels = await Hotel.create(
      [
        {
          user: user._id,
          hotelName,
          contactPhone,
          locationText,
          peakDays: Array.isArray(peakDays) ? peakDays : [],
          category,
          codePrefix, // ✅ REQUIRED by schema
          checkInSeq: 0,
        },
      ],
      { session }
    );

    const hotel = createdHotels[0];

    await session.commitTransaction();

    // Generate token
    const token = generateToken(user);

    return res.status(201).json({
      message: "Hotel account created successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role },
      hotel: {
        id: hotel._id,
        hotelName: hotel.hotelName,
        codePrefix: hotel.codePrefix,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("REGISTER HOTEL ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
}

// 2) Register Business (transaction)
async function registerBusiness(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      businessName,
      email,
      contactPhone,
      category,
      password,
      confirmPassword,
      acceptedTerms,
    } = req.body;

    if (
      !businessName ||
      !email ||
      !contactPhone ||
      !category ||
      !password ||
      !confirmPassword
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (password !== confirmPassword) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!acceptedTerms) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "You must accept the Terms and Privacy Policy" });
    }

    const emailNorm = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailNorm }).session(
      session
    );
    if (existingUser) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUsers = await User.create(
      [
        {
          name: businessName,
          email: emailNorm,
          password: hashedPassword,
          role: "BUSINESS",
          authProvider: "LOCAL",
          termsAcceptance: {
            accepted: true,
            acceptedAt: new Date(),
            version: "v1.0",
          },
        },
      ],
      { session }
    );

    const user = createdUsers[0];

    const createdBusinesses = await Business.create(
      [
        {
          user: user._id,
          businessName,
          contactPhone,
          category,
        },
      ],
      { session }
    );

    const business = createdBusinesses[0];

    await session.commitTransaction();

    const token = generateToken(user);

    return res.status(201).json({
      message: "Business account created successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role },
      business: { id: business._id, businessName: business.businessName },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("REGISTER BUSINESS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
}

// 3) Login (single endpoint for HOTEL/BUSINESS/ADMIN using password)
// (Later we’ll extend this to support Guest hotelCode login)
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const emailNorm = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailNorm }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.authProvider !== "LOCAL") {
      return res
        .status(400)
        .json({ message: `Use ${user.authProvider} login` });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { registerHotel, registerBusiness, login };
