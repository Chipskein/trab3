import { z } from 'zod';
import { PollStatusEnum } from './poll-response-dto.js';

export const PollResultOptionSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  votes: z.number().int(),
  percentage: z.number(),
});

export const PollResultsSchema = z.object({
  pollId: z.uuid(),
  title: z.string(),
  totalVotes: z.number().int(),
  status: PollStatusEnum,
  options: z.array(PollResultOptionSchema),
});

export type PollResultsDto = z.infer<typeof PollResultsSchema>;
