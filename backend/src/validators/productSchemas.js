import { z } from "zod";

const baseBody = {
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string().min(2),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative().optional(),
};

export const createProductSchema = z.object({
  body: z.object(baseBody),
});

export const updateProductSchema = z.object({
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

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
