import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  USER = 'user'
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Organization ID must be a string' })
  organizationId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatar?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatar?: string;
}
