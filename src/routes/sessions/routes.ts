
import { Router } from 'express';
import * as ctl from './handlers';

const sessionsRouter = Router({ mergeParams: true });

sessionsRouter.get('/', ctl.handleListSessions);
sessionsRouter.post('/', ctl.handleCreateSession);
sessionsRouter.put('/:sessionId', ctl.handleUpdateSession);
sessionsRouter.get('/:sessionId', ctl.handleGetSession);
sessionsRouter.delete('/:sessionId', ctl.handleDeleteSession);
sessionsRouter.post('/:sessionId/feedback', ctl.handleSubmitFeedback);

export default sessionsRouter;
