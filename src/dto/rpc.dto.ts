import { IsString, IsUrl, IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { EVM_NETWORKS } from '../types';

export class CreateRpcDto {
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @IsEnum(Object.values(EVM_NETWORKS), { message: 'Invalid network type' })
  network: EVM_NETWORKS;

  @IsNumber({}, { message: 'Chain ID must be a number' })
  @Min(1, { message: 'Chain ID must be greater than 0' })
  chainId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Timeout must be a number' })
  @Min(1000, { message: 'Timeout must be at least 1000ms' })
  @Max(30000, { message: 'Timeout must not exceed 30000ms' })
  timeout?: number;

  @IsOptional()
  @IsBoolean({ message: 'Enabled must be a boolean' })
  enabled?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a number' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(10, { message: 'Priority must not exceed 10' })
  priority?: number;
}

export class UpdateRpcDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url?: string;

  @IsOptional()
  @IsEnum(Object.values(EVM_NETWORKS), { message: 'Invalid network type' })
  network?: EVM_NETWORKS;

  @IsOptional()
  @IsNumber({}, { message: 'Chain ID must be a number' })
  @Min(1, { message: 'Chain ID must be greater than 0' })
  chainId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Timeout must be a number' })
  @Min(1000, { message: 'Timeout must be at least 1000ms' })
  @Max(30000, { message: 'Timeout must not exceed 30000ms' })
  timeout?: number;

  @IsOptional()
  @IsBoolean({ message: 'Enabled must be a boolean' })
  enabled?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a number' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(10, { message: 'Priority must not exceed 10' })
  priority?: number;
}
