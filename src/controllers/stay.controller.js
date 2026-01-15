const ApiError = require("../utils/ApiError");

const Stay = require("../models/StayModel");
const Hotel = require("../models/HotelModel");
const StayAccessCode = require("../models/StayAccessCodeModel");

/**
 * OPTIONAL (if you still want manual check-in by hotelId)
 * Guest checks in manually (NOT via hotelCode).
 * This does NOT issue/reuse a StayAccessCode. Your new flow uses login with hotelCode instead.
 */
async function checkIn(req, res, next) {
  try {
    const guestUserId = req.auth.sub;

    // If you don't have validation middleware, use req.body instead.
    const { hotelId } = req.validated?.body || req.body;

    if (!hotelId) throw new ApiError(400, "hotelId is required");

    const hotelExists = await Hotel.exists({ _id: hotelId, isActive: true });
    if (!hotelExists) throw new ApiError(404, "Hotel not found");

    const existing = await Stay.findOne({ guestUserId, status: "active" });
    if (existing)
      throw new ApiError(
        409,
        "Guest already has an active stay. Checkout first."
      );

    const stay = await Stay.create({
      guestUserId,
      hotelId,
      status: "active",
      checkInAt: new Date(),
    });

    return res.status(201).json({ ok: true, stay });
  } catch (err) {
    return next(err);
  }
}

/**
 * ✅ MAIN: Checkout current stay (Guest-initiated)
 * - marks Stay checked_out
 * - revokes StayAccessCode so hotelCode stops working after checkout
 */
async function checkOut(req, res, next) {
  try {
    const guestUserId = req.auth.sub;

    const stay = await Stay.findOne({ guestUserId, status: "active" });
    if (!stay) throw new ApiError(404, "No active stay found");

    stay.status = "checked_out";
    stay.checkOutAt = new Date();
    await stay.save();

    // revoke access code if exists
    if (stay.accessCodeId) {
      await StayAccessCode.findByIdAndUpdate(stay.accessCodeId, {
        status: "revoked",
        revokedAt: new Date(),
        expiresAt: new Date(),
      });
    }

    return res.json({ ok: true, stay });
  } catch (err) {
    return next(err);
  }
}

/**
 * ✅ MAIN: Hotel-initiated checkout (Hotel staff checks guest out)
 * Useful for your hotel dashboard/admin flow.
 * Requires stayId in body.
 */
async function checkoutGuest(req, res, next) {
  try {
    const { stayId } = req.body;

    if (!stayId) throw new ApiError(400, "stayId is required");

    const stay = await Stay.findById(stayId);
    if (!stay) throw new ApiError(404, "Stay not found");

    if (stay.status !== "active")
      throw new ApiError(400, "Stay already checked out");

    stay.status = "checked_out";
    stay.checkOutAt = new Date();
    await stay.save();

    if (stay.accessCodeId) {
      await StayAccessCode.findByIdAndUpdate(stay.accessCodeId, {
        status: "revoked",
        revokedAt: new Date(),
        expiresAt: new Date(),
      });
    }

    return res.json({ ok: true, stay });
  } catch (err) {
    return next(err);
  }
}

/**
 * ✅ Get current stay
 */
async function myCurrentStay(req, res, next) {
  try {
    const guestUserId = req.auth.sub;

    const stay = await Stay.findOne({ guestUserId, status: "active" })
      .populate("hotelId", "hotelName locationText category codePrefix")
      .lean();

    return res.json({ ok: true, stay: stay || null });
  } catch (err) {
    return next(err);
  }
}

module.exports = { checkIn, checkOut, checkoutGuest, myCurrentStay };
