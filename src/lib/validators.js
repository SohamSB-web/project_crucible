import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(3, 'Enter a valid username, ID, or email address.'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
});

export const registerSchema = z.object({
  teamName: z.string().min(2, 'Team name is required.'),
  teamSize: z.coerce.number().min(3).max(4),
  leadName: z.string().min(2, 'Lead name is required.'),
  leadEmail: z.string().email('Enter a valid email address.'),
  leadPhone: z.string().min(8, 'Phone number is required.'),
  college: z.string().min(2, 'College is required.'),
  year: z.string().min(1, 'Year is required.'),
  dept: z.string().min(1, 'Department is required.'),
  members: z.array(
    z.object({
      name: z.string().min(2, 'Member name is required.'),
      role: z.string().optional().default(''),
      email: z.string().email('Valid email required.'),
      phone: z.string().min(8, 'Phone required.'),
      year: z.string().min(1, 'Year is required.'),
      dept: z.string().min(1, 'Department is required.'),
    }),
  ),
});
