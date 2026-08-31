import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z.object({
  teamName: z.string().min(2, 'Team name is required.'),
  trackId: z.string().min(1, 'Please choose a track.'),
  teamSize: z.coerce.number().min(2).max(5),
  leadName: z.string().min(2, 'Lead name is required.'),
  leadEmail: z.string().email('Enter a valid email address.'),
  leadPhone: z.string().min(8, 'Phone number is required.'),
  college: z.string().min(2, 'College is required.'),
  year: z.string().min(1, 'Year is required.'),
  members: z.array(
    z.object({
      name: z.string().min(2, 'Member name is required.'),
      email: z.string().email('Valid email required.'),
      phone: z.string().min(8, 'Phone required.'),
      role: z.string().min(1, 'Role required.'),
    }),
  ),
});
