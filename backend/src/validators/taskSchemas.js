import { z } from 'zod';

const priorityEnum = z.enum(['low', 'medium', 'high']);
const statusEnum = z.enum(['pending', 'in_progress', 'completed']);

const baseBody = {
  title: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  category: z.string().min(2),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), {
      message: 'dueDate must be a valid date string',
    })
    .optional(),
};

export const createTaskSchema = z.object({
  body: z.object(baseBody),
});

export const updateTaskSchema = z.object({
  body: z.object({
    ...Object.fromEntries(Object.entries(baseBody).map(([key, schema]) => [key, schema.optional()])),
  }).partial(),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

