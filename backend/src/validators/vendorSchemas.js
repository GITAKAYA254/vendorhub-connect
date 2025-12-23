import { z } from 'zod';

export const createVendorSchema = z.object({
  body: z.object({
    companyName: z.string().min(2),
    description: z.string().min(10),
    website: z.string().url().optional(),
    logo: z.string().url().optional(),
  }),
});




