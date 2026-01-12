
import { Router } from 'express';
import * as ctl from './handlers';

const venuesRouter = Router();

venuesRouter.post('/', ctl.handleCreateVenue);
venuesRouter.put('/:venueId', ctl.handleUpdateVenue);
venuesRouter.get('/:venueId', ctl.handleGetSpeaker);
venuesRouter.get('/', ctl.handleListSpeakers);

export default venuesRouter;
