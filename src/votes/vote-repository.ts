import { PrismaClient } from "@prisma/client";
import { Vote } from "./vote.js";

export class VoteRepository {
    constructor(private readonly db: PrismaClient) { }

    async save(vote: Vote): Promise<void> {
        await this.db.vote.create({
            data: {
                id: vote.id,
                pollId: vote.pollId,
                optionId: vote.optionId,
                userId: vote.userId,
                createdAt: vote.createdAt
            }
        });
    }

    async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
        const count = await this.db.vote.count({
            where: {
                pollId,
                userId
            }
        });

        return count > 0;
    }

    async countByOption(pollId: string): Promise<Record<string, number>> {
        const grouped = await this.db.vote.groupBy({
            by: ["optionId"],
            where: { pollId },
            _count: { optionId: true }
        });

        return grouped.reduce<Record<string, number>>((acc, item) => {
            acc[item.optionId] = item._count.optionId;
            return acc;
        }, {});
    }
}
