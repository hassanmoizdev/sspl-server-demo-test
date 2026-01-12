
import { Router } from 'express';
import * as ctl from './handlers';

const questionnairesRouter = Router();

questionnairesRouter.post('/', ctl.handleCreateQuestionnaire);
questionnairesRouter.get('/', ctl.handleListQuestionnaires);
questionnairesRouter.get('/:questionnaireId', ctl.handleGetQuestionnaire);

export default questionnairesRouter;
