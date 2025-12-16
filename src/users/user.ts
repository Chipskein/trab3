import { hash,compare } from 'bcrypt';

export class User {
    private static readonly SALT_ROUNDS = 10;
    public readonly id: string;
    public readonly name: string;
    public readonly email: string;
    private passwordHash: string = '';

    constructor(props: {
        id?: string;
        name: string;
        email: string;
        password: string;
    }) {
        this.id = props.id ?? crypto.randomUUID();

        const name = props.name.trim().replace(/\s+/g, ' ');
        if (name.length === 0) {
            throw new Error('Nome inválido');
        }

        this.name = name;

        if (!this.isValidEmail(props.email)) {
            throw new Error('Email inválido');
        }

        this.email = props.email.toLowerCase();

        this.passwordHash = props.password;

    }

    async setPassword(password: string): Promise<void> {
        this.passwordHash = await hash(password, User.SALT_ROUNDS);
    }

    async checkPassword(password: string): Promise<boolean> {
        return await compare(password, this.passwordHash);
    }


    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    public get password(): string {
        return this.passwordHash;
    }

}
