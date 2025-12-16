import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
configDotenv();

export function decode(token:string):jwt.JwtPayload | string {
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string
    );
}