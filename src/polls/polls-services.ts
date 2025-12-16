import { PollsRepository } from "./polls-repository.js";
import { Poll, PollStatus } from "./poll.js";
import { VoteRepository } from "../votes/vote-repository.js";
import { Vote } from "../votes/vote.js";
import { NotificationService } from "../notification/interface/notification-service.js";
import { Prisma } from "@prisma/client";
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/errors.js'

interface CreatePollInput {
    title: string;
    description?: string;
    visibility: "PUBLIC" | "PRIVATE";
    startAt?: Date;
    endAt?: Date;
    expectedVotes?: number;
    categories?: string[];
    options: { text: string }[];
    createdBy: string;
}

export class PollsService {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly pollsRepository: PollsRepository,
        private readonly voteRepository: VoteRepository
    ) { }

    async createPoll(input: CreatePollInput) {
        if (!input.options || input.options.length < 2) {
            throw new BadRequestError("Poll must have at least 2 options");
        }

        if (!input.endAt && !input.expectedVotes) {
            throw new BadRequestError("Poll must have endAt or expectedVotes");
        }

        if (input.endAt && input.startAt && input.endAt < input.startAt) {
            throw new BadRequestError("endAt cannot be before startAt");
        }

        const poll = new Poll({
            title: input.title,
            description: input.description,
            visibility: input.visibility,
            startAt: input.startAt ?? new Date(),
            endAt: input.endAt,
            expectedVotes: input.expectedVotes,
            categories: input.categories,
            createdById: input.createdBy,
            options: input.options
        });

        await this.pollsRepository.salvar(poll);

        return poll;
    }

    async getPollDetails(pollId: string, userId: string) {
        const poll = await this.pollsRepository.buscarPorId(pollId);

        if (!poll) {
            throw new BadRequestError("Poll not found");
        }

        const hasVoted:boolean = await this.voteRepository.hasUserVoted(pollId, userId);

        return {
            ...poll,
            hasVoted
        };
    }

    async closePoll(pollId: string, userId: string): Promise<void> {
        const poll = await this.pollsRepository.buscarPorId(pollId);

        if (!poll) {
            throw new BadRequestError("Poll not found");
        }

        if (poll.createdById !== userId) {
            throw new ForbiddenError("Only the creator can close the poll");
        }

        if (poll.status === 'CLOSED') {
            throw new BadRequestError("Poll is already closed");
        }

        poll.close();

        await this.pollsRepository.atualizar(poll);

        const result = await this.voteRepository.countByOption(pollId);

        const sortedOptions = Object.entries(result).sort((a, b) => b[1] - a[1]);

        const winnerOption = sortedOptions.length > 0 ? sortedOptions[0][0] : "";

        const totalVotes = Object.values(result).reduce((sum, count) => sum + count, 0);

        await this.notificationService.notifyPollClosed({
            to: poll.createdBy?.email || "",
            pollTitle: poll.title,
            closedAt: new Date(),
            winnerOption,
            totalVotes
        });
    }

    async extendPoll(input: {
        pollId: string;
        userId: string;
        endAt?: Date;
        expectedVotes?: number;
    }) {
        const poll = await this.pollsRepository.buscarPorId(input.pollId);

        if (!poll) {
            throw new BadRequestError("Poll not found");
        }

        if (poll.createdById !== input.userId) {
            throw new ForbiddenError("Only the creator can extend the poll");
        }

        if (poll.status === "CLOSED") {
            throw new BadRequestError("Cannot extend a closed poll");
        }

        if (
            poll.status === "SCHEDULED" &&
            poll.startAt > new Date() &&
            poll.endAt &&
            poll.endAt < poll.startAt
        ) {
            throw new BadRequestError("endAt cannot be before startAt");
        }

        if (input.endAt && input.endAt < new Date()) {
            throw new BadRequestError("endAt cannot be in the past");
        }

        if (input.expectedVotes && input.expectedVotes <= poll.voteCount) {
            throw new BadRequestError("expectedVotes must be greater than current vote count");
        }

        poll.extend(
            input.endAt,
            input.expectedVotes
        );

        await this.pollsRepository.atualizar(poll);

        return poll;
    }

    async vote(input: {
        pollId: string;
        userId: string;
        optionId: string;
    }): Promise<void> {
        const poll = await this.pollsRepository.buscarPorId(input.pollId);

        if (!poll) {
            throw new BadRequestError("Poll not found");
        }

        if (poll.status === "CLOSED") {
            throw new BadRequestError("Poll is closed");
        }

        if (
            poll.status === "SCHEDULED" &&
            poll.startAt > new Date()
        ) {
            throw new BadRequestError("Poll has not started yet");
        }

        if ( ( poll.endAt && poll.endAt < new Date() ) ||
               poll.expectedVotes <= poll.voteCount
        ) {
            await this.closePoll(poll.id, poll.createdById);
            throw new BadRequestError("Poll has already ended");
        }

        const alreadyVoted = await this.voteRepository.hasUserVoted(
            input.pollId,
            input.userId
        );

        if (alreadyVoted) {
            throw new BadRequestError("User already voted");
        }

        poll.ensureOptionExists(input.optionId);

        const vote = new Vote({
            pollId: input.pollId,
            optionId: input.optionId,
            userId: input.userId
        });

        await this.voteRepository.save(vote);

        poll.voteCount += 1;

        await this.pollsRepository.atualizar(poll);
    }

    async getPartialResults(pollId: string, userId: string) {
        const poll = await this.pollsRepository.buscarPorId(pollId);

        if (!poll) {
            throw new BadRequestError("Poll not found");
        }

        if (
            poll.visibility === "PRIVATE" &&
            poll.createdById !== userId
        ) {
            throw new ForbiddenError("You are not allowed to see these results");
        }

        return await this.voteRepository.countByOption(pollId);
    }

    async listPolls(filters: {
        page: number;
        limit: number;
        userId?: string;
        userVotes?: boolean;
        category?: string;
        minVotes?: number;
        maxVotes?: number;
        createdFrom?: Date;
        createdTo?: Date;
        status?: string;
    }) {
        const { page, limit, minVotes, maxVotes, ...rest } = filters;

        const where: Prisma.PollWhereInput = {};

        if (rest.category) {
            where.categories = {
                contains: rest.category
            };
        }

        if (rest.status) {
            where.status = rest.status as PollStatus;
        }

        if (rest.createdFrom || rest.createdTo) {
            where.createdAt = {};
            if (rest.createdFrom) where.createdAt.gte = rest.createdFrom;
            if (rest.createdTo) where.createdAt.lte = rest.createdTo;
        }

        if (minVotes || maxVotes) {
            where.voteCount = {};
            if (minVotes) where.voteCount.gte = minVotes;
            if (maxVotes) where.voteCount.lte = maxVotes;
        }

        if (rest.userId) {
            where.OR = [
                { visibility: "PUBLIC" },
                { createdById: rest.userId }
            ];
        } else {
            where.visibility = "PUBLIC";
        }

        if (rest.userVotes && rest.userId) {
            where.votes = {
                some: {
                    userId: rest.userId
                }
            };
        } else if (rest.userVotes && !rest.userId) {
            throw new BadRequestError("userId is required when userVotes is true");
        } else if (!rest.userVotes && rest.userId) {
            where.createdById = rest.userId;
        }

        return this.pollsRepository.listarComFiltros(where, page, limit);
    }
}
