
import Questionnaire, { QuestionnaireInput } from '../models/Questionnaire';
import questionnaireSchema, { questionnaireSubmissionsSchema } from '../validators/questionnaire-data-validator';

export const createQuestionnaire = (data:QuestionnaireInput) => {
  const parsedData = questionnaireSchema.parse(data);
  return Questionnaire.create(parsedData)
};

export const listQuestionnaires = () => {
  return Questionnaire.list();
};

export const getQuestionnaire = (query?:{id?:number; conference_id?:number;}) => {
  return Questionnaire.getByQuery(query);
}

export const getAllQuestionnaire = () => {
  return Questionnaire.getAllWithQuestions();
}
