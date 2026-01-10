import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYSTACK = 'paystack',
}

export class TopUpDto {
  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({
    description: 'The ID of the credit bundle/plan being purchased',
  })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class CreateCreditPlanDto {
  @ApiProperty({ example: 'pro-pack', description: 'Unique slug for the plan' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Professional Pack', description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 60, description: 'Number of credits awarded' })
  @IsNumber()
  credits: number;

  @ApiProperty({ example: 5000, description: 'Price in NGN' })
  @IsNumber()
  priceNgn: number;

  @ApiProperty({ example: 10, description: 'Price in USD' })
  @IsNumber()
  priceUsd: number;

  @ApiProperty({ example: 'price_1Q...', description: 'Stripe Price API ID' })
  @IsString()
  @IsNotEmpty()
  stripePriceId: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCreditPlanDto extends PartialType(CreateCreditPlanDto) {}
