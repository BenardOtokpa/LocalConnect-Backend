const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const stayController = require("../controllers/stay.controller");

router.post(
  "/checkin",
  requireAuth,
  requireRole("guest"),
  validate(z.object({ body: z.object({ hotelId: z.string().min(1) }) })),
  asyncHandler(stayController.checkIn)
);

router.post(
  "/checkout",
  requireAuth,
  requireRole("guest"),
  asyncHandler(stayController.checkOut)
);

router.get(
  "/me",
  requireAuth,
  requireRole("guest"),
  asyncHandler(stayController.myCurrentStay)
);

module.exports = router;
