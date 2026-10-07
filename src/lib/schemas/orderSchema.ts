import { z } from 'zod';

export const createOrderSchema = z.object({
  userName: z.string().min(2, 'Name must be at least 2 characters'),
  userEmail: z.string().email('Invalid email address'),
  pickupSlot: z.string().min(1, 'Please select a pickup slot'),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive('Quantity must be at least 1'),
        unitPrice: z.number().positive('Price must be greater than 0'),
      })
    )
    .min(1, 'Your order must contain at least one item'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;