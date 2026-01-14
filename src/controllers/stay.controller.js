const ApiError = require("../utils/ApiError");
const Stay = require("../models/Stay");
const Hotel = require("../models/Hotel");

// Guest checks in
async function checkIn(req, res) {
  const guestUserId = req.auth.sub;
  const { hotelId } = req.validated.body;

  const hotelExists = await Hotel.exists({ _id: hotelId, isActive: true });
  if (!hotelExists) throw new ApiError(404, "Hotel not found");

  // if there is an active stay already, block (MVP rule)
  const existing = await Stay.findOne({ guestUserId, status: "active" });
  if (existing) throw new ApiError(409, "Guest already has an active stay. Checkout first.");

  const stay = await Stay.create({ guestUserId, hotelId, status: "active" });
  res.status(201).json({ ok: true, stay });
}

// Guest checks out current stay
async function checkOut(req, res) {
  const guestUserId = req.auth.sub;

  const stay = await Stay.findOne({ guestUserId, status: "active" });
  if (!stay) throw new ApiError(404, "No active stay found");

  stay.status = "checked_out";
  stay.checkOutAt = new Date();
  await stay.save();

  res.json({ ok: true, stay });
}

// Get current stay
async function myCurrentStay(req, res) {
  const guestUserId = req.auth.sub;

  const stay = await Stay.findOne({ guestUserId, status: "active" })
    .populate("hotelId", "hotelName location category")
    .lean();

  res.json({ ok: true, stay: stay || null });
}

module.exports = { checkIn, checkOut, myCurrentStay };
