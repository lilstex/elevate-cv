import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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

export class ApplicationResponseDto {
  @ApiProperty({ example: '6592f1b2c9e3...' })
  _id: string;

  @ApiProperty({ example: 'generated' })
  status: string;

  @ApiProperty({ description: 'The MD5 hash of the job description' })
  jdHash: string;
}
