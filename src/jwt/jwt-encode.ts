import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
configDotenv();

export function encode(data:any): string {
    return jwt.sign(
        data,
        process.env.JWT_SECRET as string
    )

}