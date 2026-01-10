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
  ForbiddenException,
  Delete,
  Patch,
  HttpStatus,
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
import {
  ApplicationResponseDto,
  GenerateCvDto,
  UpdateApplicationDto,
  UpdateStatusDto,
} from '../dto/application.dto';
import { PaymentService } from 'src/payment/service/payment.service';

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
    private paymentService: PaymentService,
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

    // Save to History & Log Transaction
    const savedApp = await this.appService.saveApplication({
      user: userId,
      rawJobDescription: jobData.description,
      companyName: jobData.company,
      jobTitle: jobData.title,
      jdHash: check.jdHash,
      generatedCvData: aiOutput,
      generatedCoverLetter: aiOutput.coverLetter,
    });

    // Create the success transaction record
    await this.paymentService.createTransaction(userId, jobData.company);

    return savedApp;
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
  async download(
    @Req() req,
    @Param('id') appId: string,
    @Query('template') template: string,
    @Res() res: Response,
  ) {
    const app = await this.appService.getById(appId);
    const profile = await this.profileService.getProfile(req.user._id);

    const buffer = await this.pdfService.generateCvPdf(
      app.generatedCvData,
      profile,
      template || 'modern',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CV_${app.companyName.replace(/\s/g, '_')}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the recruitment status of an application' })
  @ApiParam({
    name: 'id',
    description: 'The unique MongoDB ID of the application',
    example: '658af3...',
  })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The application status has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No application found with the provided ID.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status value provided.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.appService.updateStatus(id, updateStatusDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single application by ID' })
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user._id;
    const application = await this.appService.getById(id);

    // Ensure the application belongs to the logged-in user
    if (application.user.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view this application',
      );
    }

    return application;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update application details',
    description:
      'Updates specific fields of an application record. Only the owner of the record can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique MongoDB ID of the application record',
  })
  @ApiResponse({
    status: 200,
    description: 'The application has been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not own this record.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationDto,
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.appService.updateApplication(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete an application record' })
  @ApiParam({ name: 'id', description: 'The Application ID' })
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req.user._id;
    await this.appService.deleteApplication(id, userId);

    return {
      message: 'Application successfully deleted',
      deletedId: id,
    };
  }
}
