import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
