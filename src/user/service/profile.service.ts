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
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { workExperience: experience } },
      { new: true },
    );
  }

  async updateExperience(
    userId: string,
    expId: string,
    updateData: ExperienceDto,
  ) {
    return this.userModel.findOneAndUpdate(
      { _id: userId, 'workExperience._id': expId },
      { $set: { 'workExperience.$': updateData } },
      { new: true },
    );
  }

  async removeExperience(userId: string, expId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { workExperience: { _id: expId } } },
      { new: true },
    );
  }
}
