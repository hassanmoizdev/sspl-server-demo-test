
import { z } from 'zod';
import personSchema from './person-data-validator';
import profileSchema from './profile-data-validator';

const guestSchema = personSchema.extend({
  email: z.union([z.string().email(), z.literal('')]).optional(),
  profile: profileSchema.optional()
});

export default guestSchema;
