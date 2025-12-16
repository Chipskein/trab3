import { PrismaClient } from '@prisma/client';

// inicializa o client do ORM
export const db = new PrismaClient({
    // mostra no console as queries feitas
    log: ['query', 'info', 'warn', 'error'],
});
