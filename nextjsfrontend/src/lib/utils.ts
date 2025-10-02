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


