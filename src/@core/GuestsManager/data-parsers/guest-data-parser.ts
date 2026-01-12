
import { z } from 'zod';
import personSchema from './person-data-parser';
import profileSchema from './profile-data-parser';

const guestSchema = personSchema.extend({
  email: z.union([z.string().email(), z.literal('')]).optional(),
  profile: profileSchema.optional()
});

export type GuestData = z.infer<typeof guestSchema>;
export default guestSchema;
