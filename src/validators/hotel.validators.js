const { z } = require("zod");

const dayEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const hotelCategoryEnum = z.enum([
  "Luxury & Lifestyle",
  "Business & Conference",
  "Boutique & Art",
  "Extended Stay & Suites",
  "Resort & Leisure",
  "Others",
]);

// PATCH /api/hotels/me
const updateMyHotelSchema = z.object({
  body: z
    .object({
      hotelName: z.string().min(2).max(150).trim().optional(),
      contactPhone: z.string().min(6).max(30).trim().optional(),
      locationText: z.string().min(2).max(200).trim().optional(),
      peakDays: z.array(dayEnum).optional(),
      category: hotelCategoryEnum.optional(),
      isActive: z.boolean().optional(),
    })
    // require at least one field in PATCH body
    .refine((val) => Object.keys(val).length > 0, {
      message: "Provide at least one field to update",
    }),
});

module.exports = { updateMyHotelSchema };
