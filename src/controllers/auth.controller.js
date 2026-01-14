const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const Hotel = require("../models/HotelModel");
const generateToken = require("../utils/generateToken");

// 1) Register Hotel
async function registerHotel(req, res) {
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
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!acceptedTerms) {
      return res
        .status(400)
        .json({ message: "You must accept the Terms and Privacy Policy" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name: hotelName,
      email: emailNorm,
      password: hashedPassword, // ensure schema has select:false ideally
      role: "HOTEL",
      authProvider: "LOCAL",
      termsAcceptance: {
        accepted: true,
        acceptedAt: new Date(),
        version: "v1.0",
      },
    });

    // Create Hotel Profile
    const hotel = await Hotel.create({
      user: user._id,
      hotelName,
      contactPhone,
      locationText,
      peakDays: Array.isArray(peakDays) ? peakDays : [],
      category,
    });

    // Generate token
    const token = generateToken(user);

    return res.status(201).json({
      message: "Hotel account created successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role },
      hotel: { id: hotel._id, hotelName: hotel.hotelName },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// 2) Login (Hotel/local)
async function hotelLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailNorm = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailNorm }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "HOTEL") {
      return res.status(403).json({ message: "Not a hotel account" });
    }

    if (user.authProvider !== "LOCAL") {
      return res
        .status(400)
        .json({ message: `Use ${user.authProvider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { registerHotel, hotelLogin };
