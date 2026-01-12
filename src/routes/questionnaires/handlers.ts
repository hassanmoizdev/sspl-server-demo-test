
import { RequestHandler } from 'express';
import { createQuestionnaire, getQuestionnaire, listQuestionnaires } from '../../@core/services/questionnaires';

export const handleCreateQuestionnaire:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const questionnaire = await createQuestionnaire(data);
    res.json(questionnaire);
  }
  catch (err) {
    next(err);
  }
};

export const handleGetQuestionnaire:RequestHandler = async (req, res, next) => {
  try {
    const questionnaireId = parseInt(req.query.questionnaireId as string);
    const questionnaire = await getQuestionnaire({id: questionnaireId});
    res.json(questionnaire);
  }
  catch (err) {
    next(err);
  }
};

export const handleListQuestionnaires:RequestHandler = async (req, res, next) => {
  try {
    const questionnaires = await listQuestionnaires();
    res.json(questionnaires);
  }
  catch (err) {
    next(err);
  }
};