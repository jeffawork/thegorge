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

// Individual User Details
export const individualSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email(),
  phone: z.string().min(8, "Phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  website: z.url().optional(),
  bio: z.string().optional(),
  industry: z.string().optional(),
  useCase: z.string().optional(),
  blockchainExperience: z.string().optional(),
  termsAccepted: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type IndividualSchema = z.infer<typeof individualSchema>;

//  Organization Details
export const organizationSchema = z.object({
  orgName: z.string().min(2, "Organization name required"),
  orgDescription: z.string().optional(),
  conPerson: z.string().min(2, "Contact person required"),
  orgSize: z.string().optional(),
  orgWebsite: z.url().optional(),
  orgAddress: z.string().optional(),
  country: z.string().min(2),
  timezone: z.string().optional(),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  termsAccepted: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;
  

//  Join Existing Organization
export const joinOrgSchema = z.object({
  inviteCode: z.string().min(6, "Invite code required"),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  termsAccepted: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type JoinOrgSchema = z.infer<typeof joinOrgSchema>;
