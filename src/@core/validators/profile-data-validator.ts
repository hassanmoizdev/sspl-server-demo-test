
import { z } from 'zod';
import { isMobilePhone } from 'validator';

const profileSchema = z.object({
  title: z.string().optional(),
  overview: z.string().optional(),
  pmdc_number: z.string().optional(),
  institute: z.string().optional(),
  country: z.string().optional(),
  org_number: z.string().optional(),
  hospital: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  contact: z.object({
    email: z.union([z.string().email(), z.literal('')]).optional(),
    phone: z.union([z.string().refine((v)=>isMobilePhone(v, 'any', { strictMode: true }), { message: 'Invalid mobile number.' }), z.literal('')]).optional(),
    whatsapp: z.union([z.string().refine((v)=>isMobilePhone(v, 'any', { strictMode: true }), { message: 'Invalid mobile number.' }), z.literal('')]).optional(),
    twitter: z.string().optional(),
    skype: z.string().optional()
  }).optional()
});

export default profileSchema;
