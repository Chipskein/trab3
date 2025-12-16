import { LoginResponseDto } from "../auth/dto/login-dto.js";
import { RegisterUserDto } from "../auth/dto/register-dto.js";
import { BadRequestError } from "../errors/errors.js";
import { encode } from "../jwt/jwt-encode.js";
import { User } from "./user.js";
import { UsersRepository } from "./users-repository.js";


export class UserService {
    constructor(private readonly usersRepository: UsersRepository) {
        this.usersRepository = usersRepository;
    }

    async createUser(data: RegisterUserDto) {
        try {
            const user = new User(data);

            await user.setPassword(data.password);

            const existingUser = await this.usersRepository.buscar(user.email);
            if (existingUser) {
                throw new BadRequestError('Usuário já existe');
            }

            await this.usersRepository.salvar(user);
            return {
                id: user.id,
                name: user.name,
                email: user.email
            };
        } catch (error: any) {
            throw new Error(`Erro ao criar usuário: ${error.message}`);
        }
    }

    async login(email:string , senha:string):Promise<LoginResponseDto> {
        const user:User | null = await this.usersRepository.buscar(email);

        if (!user) {
            throw new BadRequestError('Usuário não encontrado');
        }

        if (!await user.checkPassword(senha))
            throw new BadRequestError('Usuário não encontrado');

        const jwt:string = encode({name: user.name, email: user.email, id:user.id})

        return {
            accessToken:jwt,
            user:{
                id: user.id!,
                name: user.name,
                email: user.email,
            }
        };

    }

}