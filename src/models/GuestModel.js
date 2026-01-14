function makePrefix(hotelName) {
  const clean = (hotelName || "").trim().replace(/\s+/g, " ");
  const firstWord = clean.split(" ")[0] || "HOT";
  return firstWord.slice(0, 3).toUpperCase().padEnd(3, "X");
}

module.exports = makePrefix;
