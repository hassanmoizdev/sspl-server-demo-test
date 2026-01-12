
import { z } from 'zod';
import { isMobilePhone } from 'validator';

const profileSchema = z.object({
  title: z.string().optional(),
  overview: z.string().optional(),
  pmdc_number: z.string().optional(),
  institute: z.string().optional(),
  country: z.string().optional(),
  org_number: z.string().optional(),
  contact: z.object({
    email: z.union([z.string().email(), z.literal('')]).optional(),
    phone: z.union([z.string().refine((v)=>isMobilePhone(v, 'any', { strictMode: true }), { message: 'Mobile number must start with a country code (e.g. +92), and should be of valid length.' }), z.literal('')]).optional(),
    whatsapp: z.union([z.string().refine((v)=>isMobilePhone(v, 'any', { strictMode: true }), { message: 'Mobile number must start with a country code (e.g. +92), and should be of valid length.' }), z.literal('')]).optional(),
    twitter: z.string().optional(),
    skype: z.string().optional()
  }).optional()
});

export type ProfileData = z.infer<typeof profileSchema>;
export default profileSchema;
