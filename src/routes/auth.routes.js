const express = require("express");

const router = express.Router();

router.post("/hotel/register", registerHotel);
router.post("/hotel/login", hotelLogin);

module.exports = router;
