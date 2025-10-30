/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsPhoneNumber,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
// ValidateIf and IsIn removed - not currently used

// Registration type enum
export enum RegistrationType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization',
  JOIN_ORGANIZATION = 'join_organization'
}

// User role enum (enhanced) - only used values kept
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  USER = 'user'
  // DEVELOPER, VIEWER, BILLING removed - not currently used
}

// Organization plan enum
export enum OrganizationPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Industry enum for organizations - only used values kept
export enum Industry {
  OTHER = 'other'
  // DEFI, NFT, GAMING, ENTERPRISE, STARTUP, RESEARCH, EDUCATION removed - not currently used
}

// Base registration DTO
export class BaseRegistrationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

  @IsOptional()
  @IsPhoneNumber('US', { message: 'Please provide a valid phone number' })
    phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
    jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Company must be a string' })
    company?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid website URL' })
    website?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
    bio?: string;

  @IsOptional()
  @IsBoolean({ message: 'Marketing consent must be a boolean' })
    marketingConsent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Terms acceptance must be a boolean' })
    acceptTerms?: boolean;
}

// Individual registration DTO
export class IndividualRegistrationDto extends BaseRegistrationDto {
  @IsEnum(RegistrationType, { message: 'Invalid registration type' })
    registrationType: RegistrationType.INDIVIDUAL;

  @IsOptional()
  @IsEnum(Industry, { message: 'Invalid industry' })
    industry?: Industry;

  @IsOptional()
  @IsString({ message: 'Use case must be a string' })
    useCase?: string;

  @IsOptional()
  @IsString({ message: 'Blockchain experience must be a string' })
    blockchainExperience?: string;
}

// Organization registration DTO
export class OrganizationRegistrationDto extends BaseRegistrationDto {
  @IsEnum(RegistrationType, { message: 'Invalid registration type' })
    registrationType: RegistrationType.ORGANIZATION;

  @IsString({ message: 'Organization name is required' })
  @IsNotEmpty({ message: 'Organization name cannot be empty' })
    organizationName: string;

  @IsString({ message: 'Organization slug is required' })
  @IsNotEmpty({ message: 'Organization slug cannot be empty' })
    organizationSlug: string;

  @IsOptional()
  @IsString({ message: 'Organization description must be a string' })
    organizationDescription?: string;

  @IsEnum(Industry, { message: 'Invalid industry' })
    industry: Industry;

  @IsEnum(OrganizationPlan, { message: 'Invalid organization plan' })
    plan: OrganizationPlan;

  @IsOptional()
  @IsString({ message: 'Organization size must be a string' })
    organizationSize?: string;

  @IsOptional()
  @IsString({ message: 'Organization website must be a string' })
    organizationWebsite?: string;

  @IsOptional()
  @IsString({ message: 'Organization address must be a string' })
    organizationAddress?: string;

  @IsOptional()
  @IsString({ message: 'Organization country must be a string' })
    organizationCountry?: string;

  @IsOptional()
  @IsString({ message: 'Organization timezone must be a string' })
    organizationTimezone?: string;

  @IsOptional()
  @IsString({ message: 'Use case must be a string' })
    useCase?: string;

  @IsOptional()
  @IsString({ message: 'Blockchain experience must be a string' })
    blockchainExperience?: string;

  @IsOptional()
  @IsString({ message: 'Expected RPC usage must be a string' })
    expectedRpcUsage?: string;
}

// Join organization DTO
export class JoinOrganizationDto extends BaseRegistrationDto {
  @IsEnum(RegistrationType, { message: 'Invalid registration type' })
    registrationType: RegistrationType.JOIN_ORGANIZATION;

  @IsString({ message: 'Organization ID is required' })
  @IsNotEmpty({ message: 'Organization ID cannot be empty' })
    organizationId: string;

  @IsOptional()
  @IsString({ message: 'Invitation code must be a string' })
    invitationCode?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
    department?: string;

  @IsOptional()
  @IsString({ message: 'Manager email must be a string' })
    managerEmail?: string;
}

// Union type for all registration DTOs
export type RegistrationDto = IndividualRegistrationDto | OrganizationRegistrationDto | JoinOrganizationDto;

// Login DTO (unchanged)
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

  @IsOptional()
  @IsBoolean({ message: 'Remember me must be a boolean' })
    rememberMe?: boolean;
}

// Profile update DTO
export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
    firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
    lastName?: string;

  @IsOptional()
  @IsPhoneNumber('US', { message: 'Please provide a valid phone number' })
    phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
    jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Company must be a string' })
    company?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid website URL' })
    website?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
    bio?: string;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
    avatar?: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
    timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'Marketing consent must be a boolean' })
    marketingConsent?: boolean;
}

// Password change DTO
export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
    currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
    newPassword: string;

  @IsString({ message: 'Confirm password must be a string' })
    confirmPassword: string;
}

// Forgot password DTO
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;
}

// Reset password DTO
export class ResetPasswordDto {
  @IsString({ message: 'Reset token must be a string' })
    token: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
    newPassword: string;

  @IsString({ message: 'Confirm password must be a string' })
    confirmPassword: string;
}

// Refresh token DTO
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
    refreshToken: string;
}
