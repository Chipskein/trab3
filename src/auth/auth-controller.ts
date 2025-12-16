import { Request, Response } from "express";
import { UserService } from "../users/users-services.js";
import { LoginSchema,LoginDto,LoginResponseDto } from "./dto/login-dto.js";
import { RegisterUserSchema,RegisterUserDto } from "./dto/register-dto.js";

export class AuthController {

    constructor(private readonly service: UserService) { }

    async login(req: Request, res: Response) {
        try {
            const dto:LoginDto = LoginSchema.parse(req.body);

            const data:LoginResponseDto = await this.service.login(
                dto.email,
                dto.password
            );

            if (!data)
                return res.status(401).json({
                    message: "Credenciais inválidas"
                });


            return res.status(200).json(data);

        } catch (error: any) {
            return res.status(400).json({
                message: "Dados inválidos",
                errors: error.errors ?? error.message,
            });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const dto:RegisterUserDto = RegisterUserSchema.parse(req.body);
            const user = await this.service.createUser(dto);
            return res.status(201).json(user);

        } catch (error: any) {
            return res.status(400).json({
                message: "Erro ao registrar usuário",
                errors: error.errors ?? error.message,
            });
        }
    }
}
