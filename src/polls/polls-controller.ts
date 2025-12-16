import { Response } from "express";
import { PollsService } from "./polls-services.js";
import { AuthenticatedRequest } from "../auth/interfaces/request.js";

export class PollsController {
    constructor(private readonly service: PollsService) {}

    async create(req: AuthenticatedRequest, res: Response) {
        const userId = req.user.id;

        const poll = await this.service.createPoll({
            ...req.body,
            createdBy: userId
        });

        return res.status(201).json(poll);
    }

    async list(req: AuthenticatedRequest, res: Response) {
        const {
            page = '1',
            limit = '10',
            category,
            minVotes,
            maxVotes,
            createdFrom,
            createdTo,
            status
        } = req.query;

        const result = await this.service.listPolls({
            page: Number(page),
            limit: Number(limit),
            category: category?.toString(),
            minVotes: minVotes ? Number(minVotes) : undefined,
            maxVotes: maxVotes ? Number(maxVotes) : undefined,
            createdFrom: createdFrom ? new Date(createdFrom.toString()) : undefined,
            createdTo: createdTo ? new Date(createdTo.toString()) : undefined,
            status: status?.toString()
        });

        return res.status(200).json(result);
    }

    async findById(req: AuthenticatedRequest, res: Response) {
        const pollId = req.params.pollId;
        const userId = req.user.id;

        const poll = await this.service.getPollDetails(pollId, userId);

        return res.status(200).json(poll);
    }

    async close(req: AuthenticatedRequest, res: Response) {
        const pollId = req.params.pollId;
        const userId = req.user.id;

        await this.service.closePoll(pollId, userId);

        return res.status(204).send();
    }

    async extend(req: AuthenticatedRequest, res: Response) {
        const pollId = req.params.pollId;
        const userId = req.user.id;

        const poll = await this.service.extendPoll({
            pollId,
            userId,
            ...req.body
        });

        return res.status(200).json(poll);
    }

    async vote(req: AuthenticatedRequest, res: Response) {
        const pollId = req.params.pollId;
        const userId = req.user.id;
        const { optionId } = req.body;

        await this.service.vote({
            pollId,
            userId,
            optionId
        });

        return res.status(201).send();
    }

    async results(req: AuthenticatedRequest, res: Response) {
        const pollId = req.params.pollId;
        const userId = req.user.id;

        const results = await this.service.getPartialResults(
            pollId,
            userId
        );

        return res.status(200).json(results);
    }

    async myCreated(req: AuthenticatedRequest, res: Response) {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const polls = await this.service.listPolls({
            userId,
            page: Number(page),
            limit: Number(limit)
        });

        return res.status(200).json(polls);
    }

    async myVoted(req: AuthenticatedRequest, res: Response) {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const polls = await this.service.listPolls({
            userId,
            userVotes: true,
            page: Number(page),
            limit: Number(limit)
        });
        return res.status(200).json(polls);
    }
}
