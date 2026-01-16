const ApiError = require("../utils/ApiError");
const Hotel = require("../models/HotelModel");

// Admin: get all hotels
async function getAllHotels(req, res, next) {
  try {
    const hotels = await Hotel.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, hotels });
  } catch (err) {
    return next(err);
  }
}

// Admin: get one hotel by hotelId
async function getHotelById(req, res, next) {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id).lean();
    if (!hotel) throw new ApiError(404, "Hotel not found");

    return res.json({ ok: true, hotel });
  } catch (err) {
    return next(err);
  }
}

// Hotel owner: get my hotel profile
async function getMyHotel(req, res, next) {
  try {
    const userId = req.auth.sub;

    const hotel = await Hotel.findOne({ user: userId }).lean();
    if (!hotel) throw new ApiError(404, "Hotel profile not found");

    return res.json({ ok: true, hotel });
  } catch (err) {
    return next(err);
  }
}

// Hotel owner: update my hotel profile
async function updateMyHotel(req, res, next) {
  try {
    const userId = req.auth.sub;

    const allowed = [
      "hotelName",
      "contactPhone",
      "locationText",
      "peakDays",
      "category",
      "isActive",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // prevent changing codePrefix/checkInSeq from public update
    delete updates.codePrefix;
    delete updates.checkInSeq;

    const hotel = await Hotel.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!hotel) throw new ApiError(404, "Hotel profile not found");

    return res.json({ ok: true, hotel });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAllHotels,
  getHotelById,
  getMyHotel,
  updateMyHotel,
};
