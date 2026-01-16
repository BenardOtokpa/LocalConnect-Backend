const router = require("express").Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const businessController = require("../controllers/business.controller");
const { updateMyBusinessSchema } = require("../validators/business.validators");

router.get(
  "/me",
  requireAuth,
  requireRole("BUSINESS"),
  asyncHandler(businessController.getMyBusiness)
);

router.patch(
  "/me",
  requireAuth,
  requireRole("BUSINESS"),
  validate(updateMyBusinessSchema),
  asyncHandler(businessController.updateMyBusiness)
);

// Admin
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(businessController.getBusinesses)
);
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(businessController.getBusinessById)
);

module.exports = router;
