import { z } from 'zod';

export const CreateVoteSchema = z.object({
    optionId: z.uuid(),
});

export type CreateVoteDto = z.infer<typeof CreateVoteSchema>;
