import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const signInformSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' }) 
    .email({ message: 'Invalid email address' }),

  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' }) 
    .email({ message: 'Invalid email address' })
});


// Registration Step Schemas
const baseSchema = z.object({
  accountType: z.enum(['individual', 'organization', 'join'], {
    error: 'Please select an account type',
  }),
});

const individualSchema = baseSchema.extend({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),  
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  bio: z.string().optional(),
  useCase : z.string().optional(),
  blockChainExp: z.string().optional(),
});

const organizationSchema = baseSchema.extend({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),  
  email: z.email('Invalid email address'),
  password: z.string().min(6),
  orgName: z.string().min(2, 'Organization name required'),
  orgWebsite: z.url('Invalid URL'),
  orgAddress: z.string(),
  orgCountry: z.string(),
  orgTimezone: z.string()
});
  
const joinOrgSchema = baseSchema.extend({
  inviteCode: z.string().min(4, 'Invite code required'),
  email: z.email(),
  password: z.string().min(6),
});

// Discriminated union (auto-selects schema by accountType)
const formSchema = z.discriminatedUnion('accountType', [
  individualSchema,
  organizationSchema,
  joinOrgSchema,
]);
