const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { notFound, errorHandler } = require("./middleware/error");
const authRoutes = require("./routes/auth.routes"); 
const hotelCheckinRoutes = require("./routes/hotelCheckin.routes");

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ MOUNT ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/hotel-checkin", hotelCheckinRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
