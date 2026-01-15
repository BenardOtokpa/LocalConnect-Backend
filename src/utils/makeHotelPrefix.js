function makePrefix(hotelName) {
  const clean = (hotelName || "").trim();
  const firstWord = clean.split(/\s+/)[0] || "HOT";
  return firstWord.slice(0, 3).toUpperCase().padEnd(3, "X");
}

module.exports = makePrefix;
