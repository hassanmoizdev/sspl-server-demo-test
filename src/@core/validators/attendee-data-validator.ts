
import { z } from 'zod';

const attendeeSchema = z.object({
  status: z.preprocess((v)=>String(v).toUpperCase(), z.enum(['PENDING','ACCEPTED', 'REJECTED', ''], { message: 'Invalid status value.' })).optional()
});

export default attendeeSchema;
