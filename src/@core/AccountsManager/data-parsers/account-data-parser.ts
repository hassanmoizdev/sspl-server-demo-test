
import { z } from 'zod';
import { isMobilePhone, isStrongPassword } from 'validator';

export const passwordSchema = z.object({
  password: z.string()
    .trim()
    .refine(
      (v) => isStrongPassword(v, { minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0 }),
      { message: 'Password must be atleast 8 characters long.' }
    )
});

const accountSchema = z.object({
  email: z.string().toLowerCase().email(),
  phone: z.string()
    .refine(
      (v) => isMobilePhone(v, 'any', { strictMode: true }),
      { message: 'Mobile number must start with a country code (e.g. +92), and should be of valid length.' }
    )
});

export type AccountData = z.infer<typeof accountSchema>;
export type PasswordData = z.infer<typeof passwordSchema>;

export default accountSchema;
