import { Router } from 'express';
import { db } from '../db/db-connection.js';
import { PollsController } from './polls-controller.js';
import { PollsService } from './polls-services.js';
import { PollsRepository } from './polls-repository.js';
import { VoteRepository } from '../votes/vote-repository.js';
import { AuthenticatedRequest } from '../auth/interfaces/request.js';
import { EmailNotificationService } from '../notification/email/email-notification-service.js';

const router = Router();

const controller = new PollsController(
    new PollsService(
        new EmailNotificationService(),
        new PollsRepository(db),
        new VoteRepository(db)
    )
);
router.get('/', (req, res) => controller.list(req as AuthenticatedRequest, res));
router.post('/', (req, res) => controller.create(req as AuthenticatedRequest, res));
router.post('/:pollId/close', (req, res) => controller.close(req as AuthenticatedRequest, res));
router.patch('/:pollId/extend', (req, res) => controller.extend(req as AuthenticatedRequest, res));
router.get('/:pollId', (req, res) => controller.findById(req as AuthenticatedRequest, res));
router.post('/:pollId/votes', (req, res) => controller.vote(req as AuthenticatedRequest, res));
router.get('/:pollId/results', (req, res) => controller.results(req as AuthenticatedRequest, res));

export default router;
