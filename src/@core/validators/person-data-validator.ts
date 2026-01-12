
import { z } from 'zod';

const personSchema = z.object({
  prefix: z.string().optional(),
  first_name: z.string(),
  id: z.number().optional(),
  last_name: z.string().optional(),
  gender: z.preprocess((v)=>String(v).toUpperCase(), z.enum(['', 'MALE', 'FEMALE'], { message: 'Invalid gender. Should be either "MALE" or "FEMALE"' })).optional().transform((v) => v === '' ? null : v)
});

export default personSchema;
