import { z } from 'zod';
import { PollVisibilityEnum } from './poll-create-dto.js';

export const PollStatusEnum = z.enum(['OPEN', 'CLOSED', 'SCHEDULED']);

export const PollOptionResponseSchema = z.object({
    id: z.uuid(),
    text: z.string(),
});

export const PollResponseSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    visibility: PollVisibilityEnum,
    status: PollStatusEnum,

    startAt: z.string().datetime(),
    endAt: z.string().datetime().nullable(),
    expectedVotes: z.number().int().nullable(),

    categories: z.array(z.string()).optional(),

    options: z.array(PollOptionResponseSchema),

    createdBy: z.object({
        id: z.uuid(),
        name: z.string(),
    }),
});

export type PollResponseDto = z.infer<typeof PollResponseSchema>;
