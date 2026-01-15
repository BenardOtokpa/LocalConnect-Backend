const router = require("express").Router();
const { z } = require("zod");

const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const stayController = require("../controllers/stay.controller");

/**
 * OPTIONAL: Manual check-in by hotelId (only if you still want this endpoint).
 * Your main check-in flow is guest login using hotelCode.
 */
router.post(
  "/checkin",
  requireAuth,
  requireRole("GUEST"),
  validate(z.object({ body: z.object({ hotelId: z.string().min(1) }) })),
  asyncHandler(stayController.checkIn)
);

/**
 * Guest checks out their current active stay
 * Revokes the stay access code (so hotelCode stops working)
 */
router.post(
  "/checkout",
  requireAuth,
  requireRole("GUEST"),
  asyncHandler(stayController.checkOut)
);

/**
 * Hotel checks a guest out by stayId (hotel staff action)
 * Also revokes the stay access code
 */
router.post(
  "/checkout-guest",
  requireAuth,
  requireRole("HOTEL"),
  validate(z.object({ body: z.object({ stayId: z.string().min(1) }) })),
  asyncHandler(stayController.checkoutGuest)
);

/**
 * Guest gets their current stay
 */
router.get(
  "/me",
  requireAuth,
  requireRole("GUEST"),
  asyncHandler(stayController.myCurrentStay)
);

module.exports = router;
