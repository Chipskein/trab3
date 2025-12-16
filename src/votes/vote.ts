import { randomUUID } from "crypto";

interface VoteProps {
    pollId: string;
    optionId: string;
    userId: string;
}

export class Vote {
    public readonly id: string;
    public readonly pollId: string;
    public readonly optionId: string;
    public readonly userId: string;
    public readonly createdAt: Date;

    constructor({ pollId, optionId, userId }: VoteProps) {
        this.id = randomUUID();
        this.pollId = pollId;
        this.optionId = optionId;
        this.userId = userId;
        this.createdAt = new Date();
    }
}
