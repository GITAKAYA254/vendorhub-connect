import { z } from "zod";

const jsonOrCommaSplit = z.preprocess((val) => {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [val];
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return val;
}, z.array(z.string()).optional());

const baseBody = {
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  // Allow images to be whatever (urls or nothing), filtering happens elsewhere
  images: z.any().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  tags: jsonOrCommaSplit,
};

export const createProductSchema = z.object({
  body: z.object(baseBody),
});

export const updateProductSchema = z.object({
  body: z.object(baseBody).partial(),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
