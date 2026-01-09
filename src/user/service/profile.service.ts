import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { ExperienceDto, UpdateBasicInfoDto } from '../dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getProfile(userId: string): Promise<User> {
    const profile = await this.userModel.findById(userId);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateBasicInfo(userId: string, updateData: UpdateBasicInfoDto) {
    try {
      return this.userModel.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Server Erroor');
    }
  }

  async addExperience(userId: string, experience: ExperienceDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.workExperience.push(experience as any);

    // Sort reverse-chronologically by endDate
    user.workExperience.sort((a, b) => this.compareDates(a.endDate, b.endDate));

    return user.save();
  }

  async updateExperience(
    userId: string,
    expId: string,
    updateData: ExperienceDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const expIndex = user.workExperience.findIndex(
      (exp) => exp['_id'].toString() === expId,
    );
    if (expIndex === -1)
      throw new NotFoundException('Experience record not found');

    // Update the specific record
    user.workExperience[expIndex] = {
      ...user.workExperience[expIndex],
      ...updateData,
    };

    // Re-sort the entire array
    user.workExperience.sort((a, b) => this.compareDates(a.endDate, b.endDate));

    return user.save();
  }

  async removeExperience(userId: string, expId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { workExperience: { _id: expId } } },
      { new: true },
    );
  }

  private compareDates(dateA: string, dateB: string): number {
    const parseDate = (dateStr: string) => {
      if (!dateStr || dateStr.toLowerCase() === 'present') return new Date();
      return new Date(dateStr);
    };

    return parseDate(dateB).getTime() - parseDate(dateA).getTime();
  }
}
