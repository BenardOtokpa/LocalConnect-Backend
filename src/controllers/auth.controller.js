const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/UserModel");
const Hotel = require("../models/HotelModel");
const Business = require("../models/BusinessModel");
const Guest = require("../models/GuestModel");
const Stay = require("../models/StayModel");
const StayAccessCode = require("../models/StayAccessCodeModel");
const generateToken = require("../utils/generateToken");
const makePrefix = require("../utils/makeHotelPrefix");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1) Register Hotel (prevents orphan User if Hotel save fails)
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2) Register Business
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//3) Guest Registration

async function registerGuest(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, hotelCode, acceptedTerms } = req.body;

    if (!fullName || !email || !hotelCode) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Name, Email and Hotel ID are required" });
    }
    if (!acceptedTerms) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "You must accept the Terms and Privacy Policy" });
    }

    const emailNorm = email.toLowerCase().trim();
    const codeNorm = hotelCode.toUpperCase().trim();

    // Find code by label (then compare hash)
    const codeDoc = await StayAccessCode.findOne({
      codeLabel: codeNorm,
      status: "active",
    })
      .select("+codeHash")
      .session(session);

    if (!codeDoc) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Invalid Hotel ID" });
    }

    if (codeDoc.expiresAt && codeDoc.expiresAt < new Date()) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Hotel ID expired" });
    }

    const ok = await bcrypt.compare(codeNorm, codeDoc.codeHash);
    if (!ok) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Invalid Hotel ID" });
    }

    // Email must be unique
    const existing = await User.findOne({ email: emailNorm }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ message: "Email already registered. Please login." });
    }

    // Create guest user (no password)
    const createdUsers = await User.create(
      [
        {
          name: fullName,
          email: emailNorm,
          role: "GUEST",
          authProvider: "HOTEL_CODE",
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

    const createdGuests = await Guest.create(
      [
        {
          user: user._id,
          fullName,
          lastHotelCode: codeNorm,
        },
      ],
      { session }
    );

    const guest = createdGuests[0];

    // Create active stay
    const createdStays = await Stay.create(
      [
        {
          guestUserId: user._id,
          hotelId: codeDoc.hotelId,
          accessCodeId: codeDoc._id,
          status: "active",
        },
      ],
      { session }
    );

    const stay = createdStays[0];

    // Link code to this guest + stay (so we know who owns it)
    codeDoc.guestUserId = user._id;
    codeDoc.stayId = stay._id;
    await codeDoc.save({ session });

    await session.commitTransaction();

    const token = generateToken(user);
    return res.status(201).json({
      message: "Guest account created successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role },
      guest: { id: guest._id, fullName: guest.fullName },
      stay: { id: stay._id, hotelId: stay.hotelId },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("REGISTER GUEST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
}

// 4) Login (single endpoint for HOTEL/BUSINESS/GUEST using password or Hotel Code)
async function login(req, res) {
  try {
    const { email, password, hotelCode } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Treat as password login ONLY if password is a non-empty string
    const hasPassword =
      typeof password === "string" && password.trim().length > 0;

    // ====== GUEST LOGIN (email + hotelCode) ======
    if (!hasPassword) {
      if (
        !hotelCode ||
        typeof hotelCode !== "string" ||
        hotelCode.trim().length === 0
      ) {
        return res.status(400).json({ message: "Hotel ID is required" });
      }

      const codeNorm = hotelCode.toUpperCase().trim();

      const user = await User.findOne({ email: emailNorm }).lean();
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== "GUEST" || user.authProvider !== "HOTEL_CODE") {
        return res
          .status(400)
          .json({ message: "Use password login for this account" });
      }

      const codeDoc = await StayAccessCode.findOne({
        codeLabel: codeNorm,
        status: "active",
      }).select("+codeHash");

      if (!codeDoc) {
        return res.status(401).json({ message: "Invalid or expired Hotel ID" });
      }

      // Optional time expiry (real expiry is checkout -> revoked)
      if (codeDoc.expiresAt && codeDoc.expiresAt < new Date()) {
        return res.status(401).json({ message: "Hotel ID expired" });
      }

      const ok = await bcrypt.compare(codeNorm, codeDoc.codeHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid or expired Hotel ID" });
      }

      // If code is bound to a guest, enforce same guest
      if (
        codeDoc.guestUserId &&
        codeDoc.guestUserId.toString() !== user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Hotel ID does not belong to this guest" });
      }

      // Ensure guest has an active stay linked to this code
      const stay = await Stay.findOne({
        guestUserId: user._id,
        status: "active",
        accessCodeId: codeDoc._id,
      });

      if (!stay) {
        return res
          .status(403)
          .json({ message: "No active stay for this Hotel ID" });
      }

      const token = generateToken({ _id: user._id, role: user.role });

      return res.json({
        message: "Login successful",
        token,
        user: { id: user._id, email: user.email, role: user.role },
      });
    }

    // ====== PASSWORD LOGIN (HOTEL/BUSINESS/ADMIN) ======
    const user = await User.findOne({ email: emailNorm }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Don't allow password login for guest hotel-code accounts
    if (user.role === "GUEST" || user.authProvider === "HOTEL_CODE") {
      return res
        .status(400)
        .json({ message: "Guests must login using Hotel ID" });
    }

    if (user.authProvider !== "LOCAL") {
      return res
        .status(400)
        .json({ message: `Use ${user.authProvider} login` });
    }

    const ok = await bcrypt.compare(password.trim(), user.password);
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

module.exports = { registerHotel, registerBusiness, registerGuest, login };
