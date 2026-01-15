function makeHotelPrefix(hotelName) {
  if (!hotelName) return "HOT";

  // Split name into words
  const words = hotelName.trim().split(/\s+/).filter(Boolean);

  // Take first letter of up to 3 words
  let prefix = words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("");

  // If fewer than 3 letters, pad with X
  if (prefix.length < 3) {
    prefix = prefix.padEnd(3, "N");
  }

  return prefix;
}

module.exports = makeHotelPrefix;
