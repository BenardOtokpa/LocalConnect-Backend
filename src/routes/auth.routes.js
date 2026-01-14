const express = require("express");
const { registerHotel, hotelLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/hotel/register", registerHotel);
router.post("/hotel/login", hotelLogin);

module.exports = router;
