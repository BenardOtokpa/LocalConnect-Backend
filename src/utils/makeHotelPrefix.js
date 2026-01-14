function makeHotelPrefix(hotelName) {
  if (!hotelName) return "HOT";

  // Take first letters of up to 3 words: "Eko Hotel Lagos" -> EHL
  const words = hotelName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const prefix = words
    .slice(0, 3)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  // Ensure at least 3 chars; fallback if short
  return (prefix || "HOT").padEnd(3, "X").slice(0, 3);
}

module.exports = makeHotelPrefix;
