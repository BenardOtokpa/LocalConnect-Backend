const express = require("express");
const router = express.Router();
const { issueCheckInCode } = require("../controllers/hotelCheckin.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/issue", requireAuth, requireRole("HOTEL"), issueCheckInCode);

module.exports = router;
