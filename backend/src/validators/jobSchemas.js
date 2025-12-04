import { z } from "zod";

const statusEnum = z.enum(["open", "in_progress", "completed"]);

const baseBody = {
  title: z.string().min(2),
  description: z.string().min(10),
  budget: z.number().positive(),
  category: z.string().min(2),
  status: statusEnum.optional(),
};

export const createJobSchema = z.object({
  body: z.object(baseBody),
});

export const updateJobSchema = z.object({
  body: z
    .object({
      ...Object.fromEntries(
        Object.entries(baseBody).map(([key, schema]) => [
          key,
          schema.optional(),
        ])
      ),
    })
    .partial(),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
