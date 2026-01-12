
import { Router } from 'express';
import * as ctl from './handlers';

const pusherRouter = Router();

pusherRouter.post('/user-auth', ctl.handlePusherAuthentication);
pusherRouter.post('/auth', ctl.handlePusherAuthorization);

export default pusherRouter;
