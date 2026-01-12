
import { Router } from 'express';
import * as ctl from './handlers';

const profilesRouter = Router();

profilesRouter.put('/me', ctl.handleUpdateCurrentUserProfile);
profilesRouter.get('/me', ctl.handleGetCurrentUserProfile);

export default profilesRouter;
