
import { z } from 'zod';

export const addOnSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional()
});

export const addOnsSetSchema = z.object({
  title: z.string().optional(),
  add_ons: z.array(addOnSchema)
});

export const timeSlotSchema = z.object({
  title: z.string(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  is_break: z.boolean().optional(),
  speakers: z.array(z.number().int().positive()).optional()
});

export const sessionSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  web_link: z.string().optional(),
  venue_id: z.number().positive().int().optional(),
  is_break: z.boolean().optional(),
  starts_at: z.union([z.literal(''), z.string().datetime()]).optional().transform((v) => v === '' ? null : v),
  ends_at: z.union([z.literal(''), z.string().datetime()]).optional().transform((v) => v === '' ? null : v),
  add_on_sets: z.array(addOnsSetSchema).optional(),
  breakdown: z.array(timeSlotSchema).optional()
});

const conferenceSchema = z.object({
  type: z.preprocess((v)=>String(v).toUpperCase(), z.enum(['PROGRAM','WORKSHOP'], { message: 'Invalid conference type.' })),
  title: z.string(),
  summary: z.string(),
  allow: z.array(z.string().transform(v => v.toUpperCase())),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  web_link: z.string().optional(),
  venue_id: z.number().positive().int().optional(),
  is_active: z.boolean().optional(),
  add_on_sets: z.array(addOnsSetSchema).optional(),
  sessions: z.array(sessionSchema).optional()
});

export default conferenceSchema;
