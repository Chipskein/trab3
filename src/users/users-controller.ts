import { Request, Response } from "express";
import { decode } from "../jwt/jwt-decode.js";

export class UserController {

    async getProfile(req:Request, res:Response) {
        const token: string = req.headers.authorization as string;
        try {
            const data = decode(token);
            res.json(data)
        }  catch (error) {
            res.status(400).json({msg: 'token invalido'})
        }

    }
}