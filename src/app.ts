import { configDotenv } from 'dotenv';
import express from 'express';
import authRouter from './auth/auth-routes.js'
import userRouter from './users/users-routes.js'
import pollRouter from './polls/polls-routes.js';
import { isAuthenticated } from './middlewares/is-authenticated.js';
import { AuthenticatedRequest } from './auth/interfaces/request.js';

configDotenv();

const PORT=process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/me', (req,res,next)=> isAuthenticated(req as AuthenticatedRequest, res,next), userRouter);
app.use('/polls', (req,res,next)=> isAuthenticated(req as AuthenticatedRequest ,res,next), pollRouter);
app.listen(PORT, () => {
    console.log("Running on PORT " + PORT);
});