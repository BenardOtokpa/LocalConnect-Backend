const express = require("express");
const router = express.Router();
const {
  issueStayAccessCode,
} = require("../controllers/hotelCheckin.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/issue", requireAuth, requireRole("HOTEL"), issueStayAccessCode);

module.exports = router;
