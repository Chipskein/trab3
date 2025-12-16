import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
  }),
});

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;

