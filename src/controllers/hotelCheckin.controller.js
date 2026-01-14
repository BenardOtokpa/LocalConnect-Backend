const Hotel = require("../models/HotelModel");
const CheckInCode = require("../models/CheckInCodeModel");

async function issueCheckInCode(req, res) {
  const hotelUserId = req.auth.sub;
  const { intendedEmail } = req.body || {};

  // find hotel profile
  const hotel = await Hotel.findOne({ user: hotelUserId });
  if (!hotel)
    return res.status(404).json({ message: "Hotel profile not found" });

  // atomically increment per-hotel counter
  const updatedHotel = await Hotel.findByIdAndUpdate(
    hotel._id,
    { $inc: { checkInSeq: 1 } },
    { new: true }
  );

  const seq = updatedHotel.checkInSeq;
  const code = `${updatedHotel.codePrefix}-${String(seq).padStart(3, "0")}`;

  // optional: code expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const record = await CheckInCode.create({
    hotel: updatedHotel._id,
    code,
    seq,
    status: "issued",
    expiresAt,
    intendedEmail: intendedEmail
      ? intendedEmail.toLowerCase().trim()
      : undefined,
  });

  return res.status(201).json({
    message: "Check-in code issued",
    code: record.code,
    expiresAt: record.expiresAt,
  });
}

module.exports = { issueCheckInCode };
