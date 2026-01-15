const express = require("express");
const router = express.Router();

const { registerHotel, registerBusiness,registerGuest, login } = require("../controllers/auth.controller");

router.post("/hotel/register", registerHotel);
router.post("/business/register", registerBusiness);
router.post("/guest/signup", registerGuest);
router.post("/login", login); // ✅ single login endpoint

module.exports = router;
