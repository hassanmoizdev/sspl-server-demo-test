
import { Router } from 'express';
import * as ctl from './handlers';

const guestsRouter = Router();

guestsRouter.post('/', ctl.handleCreateGuest);
guestsRouter.get('/', ctl.handleListGuests);
guestsRouter.get('/:guestId', ctl.handleGetGuest);
guestsRouter.put('/:guestId', ctl.handleUpdateGuest);
guestsRouter.delete('/:guestId', ctl.handleDeleteGuest);

export default guestsRouter;
