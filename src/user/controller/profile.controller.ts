import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfileService } from '../service/profile.service';
import { UserGuard } from 'src/security/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExperienceDto, UpdateBasicInfoDto } from '../dto/profile.dto';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user master profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyProfile(@Req() req) {
    return this.profileService.getProfile(req.user._id);
  }

  @Patch('basic')
  @ApiOperation({ summary: 'Update basic contact and summary info' })
  @ApiBody({ type: UpdateBasicInfoDto })
  async updateInfo(@Req() req, @Body() updateData: UpdateBasicInfoDto) {
    return this.profileService.updateBasicInfo(req.user._id, updateData);
  }

  @Post('experience')
  @ApiOperation({ summary: 'Add a new work experience' })
  @ApiBody({ type: ExperienceDto })
  async addExp(@Req() req, @Body() experience: ExperienceDto) {
    return this.profileService.addExperience(req.user._id, experience);
  }

  @Patch('experience/:id')
  @ApiOperation({ summary: 'Update an existing work experience' })
  @ApiParam({ name: 'id', description: 'The unique ID of the experience item' })
  @ApiBody({ type: ExperienceDto })
  async updateExp(
    @Req() req,
    @Param('id') expId: string,
    @Body() data: ExperienceDto,
  ) {
    return this.profileService.updateExperience(req.user._id, expId, data);
  }

  @Delete('experience/:id')
  @ApiOperation({ summary: 'Remove a work experience' })
  @ApiParam({ name: 'id', description: 'The unique ID of the experience item' })
  async removeExp(@Req() req, @Param('id') expId: string) {
    return this.profileService.removeExperience(req.user._id, expId);
  }
}
