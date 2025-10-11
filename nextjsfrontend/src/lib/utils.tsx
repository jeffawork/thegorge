import type { JSX } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Activity,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    .email({ message: 'Invalid email address' }),
});

// Registration Step Schemas

// Individual User Details
export const individualSchema = z
  .object({
    registrationType: z.literal('individual').optional(),
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.email('invalid email address'),
    phone: z.string().min(8, 'Phone number required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

//  Organization Details
export const organizationSchema = z
  .object({
    registrationType: z.literal('organization').optional(),
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'Contact Person first name required'),
    lastName: z.string().min(2, 'Contact Person last name required'),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

//  Join Existing Organization
export const joinOrgSchema = z
  .object({
    registrationType: z.literal('join_organization').optional(),
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.email('invalid email address'),
    managerEmail: z.email('invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    jobTitle: z.string().optional(),
    organizationId: z.string().min(2, 'Organization ID required'),
    invitationCode: z.string().min(2, 'Invitation Code required'),
    acceptTerms: z.boolean(),
    marketingConsent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export const registerSchema = z.discriminatedUnion('type', [
  individualSchema,
  organizationSchema,
  joinOrgSchema,
]);

// Sync State Utils
export const getHealthColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

export const getSyncStateStatusColor = (status: string) => {
  switch (status) {
    case 'synced':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'syncing':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'behind':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'stuck':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case 'synced':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'syncing':
      return <Clock className="h-5 w-5 text-yellow-400" />;
    case 'behind':
      return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    case 'stuck':
      return <XCircle className="h-5 w-5 text-red-400" />;
    default:
      return <Activity className="h-5 w-5 text-gray-400" />;
  }
};

// portfolio

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatBalance = (balance: string, decimals: number = 6) => {
  const num = parseFloat(balance);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(decimals);
};

export const getChangeColor = (change: number) => {
  return change >= 0 ? 'text-green-400' : 'text-red-400';
};

export const getChangeIcon = (change: number) => {
  return change >= 0 ? TrendingUp : TrendingDown;
};
