const { z } = require("zod");

const updateMyGuestSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(120).trim().optional(),
      email: z.string().email().toLowerCase().trim().optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: "Provide name or email to update",
    }),
});

module.exports = { updateMyGuestSchema };
