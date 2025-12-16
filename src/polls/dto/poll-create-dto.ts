import { z } from 'zod';

export const PollVisibilityEnum = z.enum(['PUBLIC', 'PRIVATE']);

export const PollOptionCreateSchema = z.object({
    text: z.string().min(1, 'Option text is required'),
});

export const CreatePollSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    visibility: PollVisibilityEnum,

    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    expectedVotes: z.number().int().positive().optional(),

    categories: z.array(z.string()).optional(),

    options: z.array(PollOptionCreateSchema)
        .min(2, 'At least 2 options are required'),
}).refine(
    (data) => data.endAt || data.expectedVotes,
    {
        message: 'Either endAt or expectedVotes must be provided',
        path: ['endAt'],
    }
);

export type CreatePollDto = z.infer<typeof CreatePollSchema>;
