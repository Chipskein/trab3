import { Prisma, PrismaClient } from '@prisma/client';
import { User } from "./user.js";

export class UsersRepository {

    constructor(private readonly dbCon:PrismaClient) {
        this.dbCon = dbCon;
    }

    async salvar(user:User) {
        await this.dbCon.usuario.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password
            }
        });
    }

    async buscar(email: string): Promise<User | null> {
        const data = await this.dbCon.usuario.findUnique({
            where: {
                email
            }
        })

        if (data) {
            const user = new User(data);
            return user;
        }

        return null;
    }

}