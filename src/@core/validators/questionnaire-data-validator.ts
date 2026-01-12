
import { z } from 'zod';

export const responseOptionSchema = z.object({
  label: z.string().optional(),
  value: z.string()
});

export const subQuestionSchema = z.object({
  statement: z.string(),
  description: z.string().optional(),
  type: z.string().optional()
});

export const questionSchema = z.object({
  statement: z.string(),
  description: z.string().optional(),
  type: z.enum(['COMMENT','CHOICE', 'EVALUATION', 'YESNO']).optional(),
  options: z.array(responseOptionSchema).optional(),
  statements: z.array(subQuestionSchema).optional()
});

export const questionGroupSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  questions: z.array(questionSchema).optional()
});

export const questionResponseSchema = z.object({
  value: z.string().optional(),
  question_id: z.number().positive()
});

export const questionnaireSubmissionsSchema = z.array(questionResponseSchema);

const questionnaireSchema = z.object({
  title: z.string().optional(),
  question_groups: z.array(questionGroupSchema).optional(),
  session_id: z.number().positive().optional(),
  conference_id: z.number().positive().optional(),
});

export default questionnaireSchema;
