import { clsx, type ClassValue } from "clsx"
import { m } from "framer-motion";
import { twMerge } from "tailwind-merge"
import { z } from "zod"

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
  registrationType: z.literal("individual").optional(),
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.email("invalid email address"),
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
  acceptTerms: z.boolean(),
  marketingConsent: z.boolean().optional(), 
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});



//  Organization Details
export const organizationSchema = z.object({
 registrationType: z.literal("organization").optional(),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Contact Person first name required"),
  lastName: z.string().min(2, "Contact Person last name required"),
  organizationDescription: z.string().optional(),
  organizationSlug: z.string().optional(),
  organizationSize: z.string().optional(),
  organizationWebsite: z.url().optional(),
  organizationAddress: z.string().optional(),
  organizationCountry: z.string().optional(),
  organizationTimezone: z.string().optional(),
  useCase: z.string().optional(),
  blockchainExperience: z.string().optional(),
  acceptTerms: z.boolean(),
  marketingConsent: z.boolean().optional(), 
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});


  

//  Join Existing Organization
export const joinOrgSchema = z.object({
  registrationType: z.literal("join_organization").optional(),
 firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.email("invalid email address"),
  managerEmail: z.email("invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  jobTitle: z.string().optional(),
  organizationId: z.string().min(2, "Organization ID required"),
  invitationCode: z.string().min(2, "Invitation Code required"),
  acceptTerms: z.boolean(),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const registerSchema = z.discriminatedUnion("type", [
  individualSchema,
  organizationSchema,
  joinOrgSchema,
]);
