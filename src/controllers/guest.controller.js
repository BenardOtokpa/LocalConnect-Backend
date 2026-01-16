const ApiError = require("../utils/ApiError");
const User = require("../models/UserModel");
const Guest = require("../models/GuestModel");

async function getMyGuest(req, res, next) {
  try {
    const userId = req.auth.sub;

    const user = await User.findById(userId).lean();
    if (!user) throw new ApiError(404, "User not found");

    if (user.role !== "GUEST") throw new ApiError(403, "Forbidden");

    // optional guest profile
    const guest = await Guest.findOne({ user: userId }).lean();

    return res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      guest: guest || null,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateMyGuest(req, res, next) {
  try {
    const userId = req.auth.sub;
    const { name, email } = req.validated?.body || req.body;

    // Only allow these 2 fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    // Prevent empty patch
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "Provide name or email to update");
    }

    // If email is changing, check uniqueness
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (exists) throw new ApiError(409, "Email already in use");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) throw new ApiError(404, "User not found");
    if (user.role !== "GUEST") throw new ApiError(403, "Forbidden");

    // Keep Guest profile in sync if you store fullName there
    if (updates.name) {
      await Guest.findOneAndUpdate(
        { user: userId },
        { $set: { fullName: updates.name } },
        { new: true }
      );
    }

    return res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMyGuest, updateMyGuest };
