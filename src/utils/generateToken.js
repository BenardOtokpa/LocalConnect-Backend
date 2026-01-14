const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      sub: user._id.toString(), // subject = user id
      role: user.role, // HOTEL | BUSINESS | GUEST
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // access token lifespan
    }
  );
};

module.exports = generateToken;

