const { z } = require("zod");

const businessCategoryEnum = z.enum([
  "Restaurant/Cafe",
  "Tours & Experiences",
  "Shopping & Artisan",
  "Wellness & Beauty",
  "Transport & Convenience",
  "Others",
]);

// PATCH /api/businesses/me
const updateMyBusinessSchema = z.object({
  body: z
    .object({
      businessName: z.string().min(2).max(120).trim().optional(),
      contactPhone: z.string().min(6).max(30).trim().optional(),
      category: businessCategoryEnum.optional(),
      isActive: z.boolean().optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: "Provide at least one field to update",
    }),
});

module.exports = { updateMyBusinessSchema };
