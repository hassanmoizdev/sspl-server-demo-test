import { z } from 'zod';

export const scenarioOptionSchema = z.object({
  label: z.string(),
  is_correct: z.boolean().default(false)
});

export const scenarioQuestionSchema = z.object({
  statement: z.string(),
  description: z.string().optional(),
  type: z.enum(['CHOICE', 'TRUE_FALSE']).optional().default('CHOICE'),
  order: z.number().int().optional().default(0),
  options: z.array(scenarioOptionSchema)
});

export const createScenarioSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(scenarioQuestionSchema)
});

export const createSessionSchema = z.object({
  scenario_id: z.number().positive(),
  expires_at: z.string().datetime() // ISO 8601 string
});

export const joinSessionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  device_token: z.string().optional(),
  device_platform: z.enum(['ios', 'android']).optional()
});

export const submitAnswerSchema = z.object({
  participant_id: z.coerce.number().positive(),
  question_id: z.coerce.number().positive(),
  option_id: z.coerce.number().positive()
});
