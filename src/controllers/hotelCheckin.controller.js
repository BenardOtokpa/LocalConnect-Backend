const bcrypt = require("bcryptjs");
const Hotel = require("../models/HotelModel");
const StayAccessCode = require("../models/StayAccessCodeModel");

async function issueStayAccessCode(req, res) {
  try {
    const hotelUserId = req.auth.sub;

    const hotel = await Hotel.findOne({ user: hotelUserId });
    if (!hotel)
      return res.status(404).json({ message: "Hotel profile not found" });

    // increment per hotel
    const updated = await Hotel.findByIdAndUpdate(
      hotel._id,
      { $inc: { checkInSeq: 1 } },
      { new: true }
    );

    const seq = updated.checkInSeq;
    const codeLabel = `${updated.codePrefix}-${String(seq).padStart(3, "0")}`; // EHL-094

    // hash code
    const codeHash = await bcrypt.hash(codeLabel, 10);

    // optional: default validity window (e.g. 7 days) – will still be revoked on checkout
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await StayAccessCode.create({
      hotelId: updated._id,
      codeLabel,
      codeHash,
      status: "active",
      expiresAt,
    });

    // IMPORTANT: return raw code ONCE to hotel
    return res.status(201).json({
      message: "Stay access code issued",
      hotelId: updated._id,
      code: codeLabel,
      expiresAt,
    });
  } catch (err) {
    console.error("ISSUE CODE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { issueStayAccessCode };
