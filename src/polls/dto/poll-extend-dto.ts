import { z } from 'zod';

export const ExtendPollSchema = z.object({
    endAt: z.string().datetime().optional(),
    expectedVotes: z.number().int().positive().optional(),
}).refine(
    (data) => data.endAt || data.expectedVotes,
    {
        message: 'At least one field must be provided',
    }
);

export type ExtendPollDto = z.infer<typeof ExtendPollSchema>;
