import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from '../auth/interfaces/request.js'
import { decode } from '../jwt/jwt-decode.js';

export function isAuthenticated(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não informado" });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
        return res.status(401).json({ message: "Token mal formatado" });
    }
    try {
        const decoded: any = decode(token);
        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
        };
        return next();
    } catch(err:any) {
        console.log(err)
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}
