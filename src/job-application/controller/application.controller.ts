import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { UserGuard } from 'src/security/guards/auth.guard';
import { ApplicationService } from '../service/application.service';
import { OpenAIService } from '../service/openai.service';
import { PdfService } from '../service/pdf.service';
import { ProfileService } from 'src/user/service/profile.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationResponseDto, GenerateCvDto } from '../dto/application.dto';

@ApiTags('Job Application')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('application')
export class ApplicationController {
  constructor(
    private appService: ApplicationService,
    private aiService: OpenAIService,
    private pdfService: PdfService,
    private profileService: ProfileService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Process JD and generate tailored CV/Cover Letter' })
  @ApiBody({ type: GenerateCvDto })
  @ApiResponse({
    status: 200,
    description: 'CV generated or existing one found.',
    type: ApplicationResponseDto,
  })
  async generate(@Req() req, @Body() jobData: GenerateCvDto) {
    const userId = req.user._id;

    // Check for duplicates
    const check = await this.appService.processJobApplication(userId, jobData);
    if (check.isDuplicate) return check;

    // Fetch Master Profile to feed to the AI
    const profile = await this.profileService.getProfile(userId);

    // Generate structured content with OpenAI
    const aiOutput = await this.aiService.generateTailoredContent(
      profile,
      jobData.description,
    );

    // Save to History
    return this.appService.saveApplication({
      user: userId,
      ...jobData,
      jdHash: check.jdHash,
      generatedCvData: aiOutput,
      generatedCoverLetter: aiOutput.coverLetter,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all job applications for the logged-in user with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req.user._id;
    return this.appService.getUserApplications(userId, page, limit);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Stream the generated CV as a PDF file' })
  @ApiParam({ name: 'id', description: 'The Application History ID' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'The CV PDF file.',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
    },
  })
  async download(@Req() req, @Param('id') appId: string, @Res() res: Response) {
    const app = await this.appService.getById(appId);
    const profile = await this.profileService.getProfile(req.user._id);

    const buffer = await this.pdfService.generateCvPdf(
      app.generatedCvData,
      profile,
      app.templateId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CV_${app.companyName.replace(/\s/g, '_')}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
