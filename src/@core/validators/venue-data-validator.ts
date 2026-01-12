
import { z } from 'zod';

const venueSchema = z.object({
  title: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  radius: z.number().positive().optional()
});

export default venueSchema;
