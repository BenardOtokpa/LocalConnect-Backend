const router = require("express").Router();

const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const guestController = require("../controllers/guest.controller");
const { updateMyGuestSchema } = require("../validators/guest.validators");

router.get(
  "/me",
  requireAuth,
  requireRole("GUEST"),
  asyncHandler(guestController.getMyGuest)
);

router.patch(
  "/me",
  requireAuth,
  requireRole("GUEST"),
  validate(updateMyGuestSchema),
  asyncHandler(guestController.updateMyGuest)
);

module.exports = router;
