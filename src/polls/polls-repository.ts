import { Prisma, PrismaClient } from '@prisma/client';
import { Poll, PollStatus, PollVisibility } from './poll.js'
export class PollsRepository {
    constructor(private readonly dbCon: PrismaClient) { }

    async salvar(poll: Poll): Promise<void> {
        await this.dbCon.poll.create({
            data: {
                id: poll.id,
                title: poll.title,
                description: poll.description,

                visibility: poll.visibility,
                status: poll.status,

                startAt: poll.startAt,
                endAt: poll.endAt ?? null,
                expectedVotes: poll.expectedVotes ?? null,

                categories: poll.categories ? poll.categories.join(','):"",

                createdById: poll.createdById,

                options: {
                    create: poll.options.map(option => ({
                        text: option.text,
                    }))
                }
            },
        });
    }

    async buscarPorId(id: string): Promise<Poll | null> {
        const data = await this.dbCon.poll.findUnique({
            where: { id },
            include: {
                options: true,
                createdBy: true,
            },
        });

        if (!data) return null;

        const poll = new Poll(
            {
                voteCount: data.voteCount,
                title: data.title,
                description: data.description ? data.description : "",
                visibility: data.visibility ? data.visibility as PollVisibility : "PUBLIC",
                status: data.status as PollStatus,
                startAt: data.startAt,
                endAt: data.endAt ?? undefined,
                expectedVotes: data.expectedVotes ?? undefined,
                categories: data.categories ? data.categories.split(',') : [],
                createdById: data.createdById,
                createdBy:data.createdBy,
                options: data.options.map(optionData => ({
                    id: optionData.id,
                    pollId: optionData.pollId,
                    text: optionData.text,
                })),
            },
            data.id
        );

        return poll;
    }

    async atualizar(poll: Poll): Promise<void> {
        await this.dbCon.poll.update({
            where: { id: poll.id },
            data: {
                voteCount: poll.voteCount,
                status: poll.status,
                endAt: poll.endAt ?? null,
                expectedVotes: poll.expectedVotes ?? null,
            },
        });
    }

    async listarComFiltros(
        filters:Prisma.PollWhereInput,
        page:number =1,
        limit:number = 10
    ): Promise<{ polls: Poll[]; total: number }> {
        const offset = (page - 1) * limit;
        const [polls, total] = await Promise.all([
            this.dbCon.poll.findMany({
                where: filters,
                include:{
                    options: {
                        select:{
                            id: true,
                            pollId: true,
                            text: true,
                        }
                    },
                    createdBy: {
                        select:{
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                },
                skip: offset,
                take: limit,
            }),
            this.dbCon.poll.count({ where: filters }),
        ]);
        return {
            polls: polls.map(data => new Poll({
                voteCount: data.voteCount,
                title: data.title,
                description: data.description ? data.description : "",
                visibility: data.visibility ? data.visibility as PollVisibility : "PUBLIC",
                status: data.status as PollStatus,
                startAt: data.startAt,
                endAt: data.endAt ?? undefined,
                expectedVotes: data.expectedVotes ?? undefined,
                categories: data.categories ? data.categories.split(',') : [],
                createdById: data.createdById,
                createdBy:data.createdBy,
                options: data.options.map(optionData => ({
                    id: optionData.id,
                    pollId: optionData.pollId,
                    text: optionData.text,
                }))},
                data.id
            )),
            total
        };
    }

}
