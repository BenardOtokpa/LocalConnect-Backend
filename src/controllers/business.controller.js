const ApiError = require("../utils/ApiError");
const Business = require("../models/BusinessModel");

// Admin and Hotels: get all businesses
async function getBusinesses(req, res, next) {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 }).lean();

    return res.json({ ok: true, businesses });
  } catch (err) {
    return next(err);
  }
}

// Admin and Hotels: get one business by id
async function getBusinessById(req, res, next) {
  try {
    const { id } = req.params;

    const business = await Business.findById(id).lean();
    if (!business) throw new ApiError(404, "Business not found");

    return res.json({ ok: true, business });
  } catch (err) {
    return next(err);
  }
}

// Business owner: get my business profile
async function getMyBusiness(req, res, next) {
  try {
    const userId = req.auth.sub;

    const business = await Business.findOne({ user: userId }).lean();
    if (!business) throw new ApiError(404, "Business profile not found");

    return res.json({ ok: true, business });
  } catch (err) {
    return next(err);
  }
}

// Business owner: update my business profile
async function updateMyBusiness(req, res, next) {
  try {
    const userId = req.auth.sub;

    const allowed = ["businessName", "contactPhone", "category", "isActive"];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const business = await Business.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!business) throw new ApiError(404, "Business profile not found");

    return res.json({ ok: true, business });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getBusinesses,
  getBusinessById,
  getMyBusiness,
  updateMyBusiness,
};
