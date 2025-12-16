import { Usuario } from '@prisma/client';
import { randomUUID } from 'crypto';

export type PollVisibility = 'PUBLIC' | 'PRIVATE';
export type PollStatus = 'OPEN' | 'CLOSED' | 'SCHEDULED';

export interface PollProps {
    title: string;
    description?: string;
    visibility: PollVisibility;
    startAt: Date;
    endAt?: Date;
    status?: PollStatus;
    createdBy?: {name: string, email: string, id:string} | Usuario;
    expectedVotes?: number;
    categories?: string[];
    options: { id?:string, text: string }[];
    createdById: string;
    voteCount?: number;
}

export class Poll {
    public readonly id: string;
    public readonly createdById: string;
    public readonly createdBy?: { name: string, email: string, id: string } | Usuario;
    public readonly createdAt: Date;
    public options: { text: string; }[] = [];
    public title: string;
    public description?: string;
    public visibility: PollVisibility;
    public status: PollStatus;

    public startAt: Date;
    public endAt?: Date;
    public expectedVotes: number = 100;

    public categories?: string[];
    public voteCount: number = 0;

    constructor(props: PollProps, id?: string) {
        this.id = id ?? randomUUID();
        this.createdById = props.createdById;
        this.createdBy = props.createdBy;

        this.title = props.title;
        this.description = props.description;
        this.visibility = props.visibility;

        this.startAt = props.startAt;
        this.endAt = props.endAt;
        this.expectedVotes = props.expectedVotes ?? 100;

        this.categories = props.categories;
        this.options = props.options;

        this.status = this.resolveInitialStatus(props.status);
        this.createdAt = new Date();
        this.voteCount = props.voteCount ?? 0;
    }

    private resolveInitialStatus(status?: PollStatus): PollStatus {
        if (this.startAt > new Date() && (status === 'OPEN' || !status)) {
            return 'SCHEDULED';
        }
        return status ?? 'OPEN';
    }

    close(): void {
        if (this.status === 'CLOSED') return;
        this.status = 'CLOSED';
    }

    extend(endAt?: Date, expectedVotes?: number): void {
        if (endAt && endAt < new Date()) {
            throw new Error('endAt cannot be in the past');
        }

        if (endAt) this.endAt = endAt;
        if (expectedVotes) this.expectedVotes = expectedVotes;
    }

    ensureOptionExists(optionId: string) {
        const optionExists:boolean = this.options?.some((option: any) => option.id === optionId);
        if (!optionExists) {
            throw new Error('Option does not exist in this poll');
        }
    }

}

