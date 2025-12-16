import { z } from 'zod';
import { PollVisibilityEnum } from './poll-create-dto.js';
import { PollStatusEnum } from './poll-response-dto.js';

export const PollDetailsOptionSchema = z.object({
    id: z.uuid(),
    text: z.string(),
});

export const PollDetailsSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: PollVisibilityEnum,
    status: PollStatusEnum,

    startAt: z.string().datetime(),
    endAt: z.string().datetime().nullable(),
    expectedVotes: z.number().nullable(),

    options: z.array(PollDetailsOptionSchema),

    hasVoted: z.boolean(),
});

export type PollDetailsDto = z.infer<typeof PollDetailsSchema>;
