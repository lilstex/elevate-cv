import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class GenerateCvDto {
  @ApiProperty({
    example: 'Senior Laravel Developer',
    description: 'The title of the job you are applying for',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Tech Solutions Malta',
    description: 'The name of the hiring company',
  })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({
    example:
      'We are looking for a backend engineer with 5+ years of experience in...',
    description: 'The full job description text',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  description: string;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    example: 'Senior Backend Engineer',
    description: 'The tailored job title',
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({
    example: 'Tech Solutions Inc.',
    description: 'The name of the company',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Dear Hiring Manager...',
    description: 'The full AI-generated cover letter text',
  })
  @IsOptional()
  @IsString()
  generatedCoverLetter?: string;

  @ApiPropertyOptional({
    description:
      'The complex CV data object containing summary, experience, skills, and education',
    example: {
      professionalSummary: 'Result-driven engineer...',
      refinedExperience: [
        {
          role: 'Lead Dev',
          company: 'Acme',
          startDate: '2020',
          endDate: '2022',
          highlights: ['Led team'],
        },
      ],
      relevantSkills: ['NodeJS', 'TypeScript'],
      education: [{ degree: 'BSc', school: 'Uni', year: '2019' }],
      certifications: [{ title: 'AWS Cert', issuer: 'Amazon', date: '2023' }],
    },
  })
  @IsOptional()
  @IsObject()
  generatedCvData?: {
    professionalSummary: string;
    refinedExperience: any[];
    relevantSkills: string[];
    education: any[];
    certifications: any[];
  };
}

export class ApplicationResponseDto {
  @ApiProperty({ example: '6592f1b2c9e3...' })
  _id: string;

  @ApiProperty({ example: 'generated' })
  status: string;

  @ApiProperty({ description: 'The MD5 hash of the job description' })
  jdHash: string;
}
