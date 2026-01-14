const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/businesses", require("./business.routes"));
router.use("/deals", require("./deal.routes"));
router.use("/partnerships", require("./partnership.routes"));
router.use("/referrals", require("./referral.routes"));
router.use("/redemptions", require("./redemption.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/messages", require("./message.routes"));

router.use("/stays", require("./stay.routes"));
router.use("/guest", require("./guest.routes"));
router.use("/hotel-partnerships", require("./hotelPartnership.routes"));

module.exports = router;
