import { Router } from 'express';
import { UserController } from './users-controller.js';
import { PollsController } from '../polls/polls-controller.js'
import { VoteRepository } from '../votes/vote-repository.js';
import { PollsRepository } from '../polls/polls-repository.js';
import { PollsService } from '../polls/polls-services.js';
import { db } from '../db/db-connection.js'
import { AuthenticatedRequest } from '../auth/interfaces/request.js'
import { EmailNotificationService } from '../notification/email/email-notification-service.js';

const router = Router();

const userController = new UserController();

const pollsController = new PollsController(
    new PollsService(
        new EmailNotificationService(),
        new PollsRepository(db),
        new VoteRepository(db)
    )
);

router.get('/', (req, res) => userController.getProfile(req, res))
router.get('/polls/created', (req, res) => pollsController.myCreated(req as AuthenticatedRequest,res))
router.get('/polls/voted', (req, res) => pollsController.myVoted(req as AuthenticatedRequest, res))

export default router;