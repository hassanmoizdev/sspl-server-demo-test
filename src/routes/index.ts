
import { Router } from 'express';
import apiErrorHandler from '../middlewares/api-error-handler';
import orgContextInitHandler from '../middlewares/org-context-init-handler';
import authValidationHandler from '../middlewares/auth-validation-handler';
import authContextInitHandler from '../middlewares/auth-context-init-handler';
import authRouter from './auth';
import pusherRouter from './pusher';
import profilesRouter from './profiles';
import guestsRouter from './guests';
import venuesRouter from './venues';
import conferencesRouter from './conferences';
import questionnairesRouter from './questionnaires';
import sessionsRouter from './sessions';
import postsRouter from './posts';
import usersRouter from './users/routes';
import pollsRouter from './poll/routes';
import meetingRouter from './meeting/routes';
import membershipRouter from './membership/routes';
import abstractSubmissionRouter from './abstractSubmission/routes';
import exhibitionStallRouter from './exhibitionStall/routes';
import transactionHistoryRouter from './transactionHistory/routes';
import { scenariosAdminRouter, scenariosPublicRouter } from './scenarios/routes';

const apiRouter = Router();

apiRouter.use(orgContextInitHandler);
apiRouter.use('/auth', authRouter);

// Public scenario routes (no auth required - for participants joining with join code)
// MUST be registered BEFORE auth middleware to ensure no auth is applied
apiRouter.use('/scenarios', scenariosPublicRouter);

// Apply auth middleware globally for all subsequent routes
apiRouter.use(authValidationHandler, authContextInitHandler);

// Admin scenario routes (auth required)
// Registered after auth middleware, so auth is automatically applied
apiRouter.use('/scenarios', scenariosAdminRouter);

apiRouter.use('/users', usersRouter);
apiRouter.use('/pusher', pusherRouter);
apiRouter.use('/profiles', profilesRouter);
apiRouter.use(['/guests', '/speakers'], guestsRouter);
apiRouter.use('/venues', venuesRouter);
apiRouter.use('/conferences/:conferenceId/sessions', sessionsRouter);
apiRouter.use('/conferences', conferencesRouter);
apiRouter.use('/quest', questionnairesRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/poll', pollsRouter);
apiRouter.use('/meeting', meetingRouter);
apiRouter.use('/membership', membershipRouter);
apiRouter.use('/abstractSubmission', abstractSubmissionRouter);
apiRouter.use('/exhibitionStall', exhibitionStallRouter);
apiRouter.use('/transactionHistory', transactionHistoryRouter);

apiRouter.use(apiErrorHandler);

export default apiRouter;