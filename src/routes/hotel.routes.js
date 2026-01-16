const router = require("express").Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const hotelController = require("../controllers/hotel.controller");
const { updateMyHotelSchema } = require("../validators/hotel.validators");

router.get(
  "/me",
  requireAuth,
  requireRole("HOTEL"),
  asyncHandler(hotelController.getMyHotel)
);

router.patch(
  "/me",
  requireAuth,
  requireRole("HOTEL"),
  validate(updateMyHotelSchema),
  asyncHandler(hotelController.updateMyHotel)
);

// Admin
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(hotelController.getAllHotels)
);
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(hotelController.getHotelById)
);

module.exports = router;
