
import { z } from 'zod';
import { isMobilePhone, isStrongPassword } from 'validator';

const accountSchema = z.object({
  email: z.string().toLowerCase().email(),
  phone: z.string().refine((v)=>isMobilePhone(v, 'any', { strictMode: true }), { message: 'Invalid mobile number.' }),
    status: z.string().optional(),
    mem_no: z.string().optional(),
});

export const passwordSchema = z.object({
  password: z.string().trim().refine((v)=>isStrongPassword(v, { minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0 }), { message: 'Password must be atleast 8 characters long.' })
});

export default accountSchema;
