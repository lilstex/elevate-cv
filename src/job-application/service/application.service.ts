import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { ApplicationHistory } from '../schema/application-history.schema';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(ApplicationHistory.name)
    private applicationModel: Model<ApplicationHistory>,
  ) {}

  generateJdHash(jobDescription: string): string {
    const normalizedJd = jobDescription
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all whitespace
      .trim();

    return crypto.createHash('md5').update(normalizedJd).digest('hex');
  }

  async findExistingApplication(userId: string, jdHash: string) {
    return this.applicationModel.findOne({ user: userId, jdHash });
  }

  async saveApplication(data: any): Promise<ApplicationHistory> {
    const newApplication = new this.applicationModel(data);
    return newApplication.save();
  }

  async getById(id: string): Promise<ApplicationHistory> {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application history not found');
    }
    return application;
  }

  async getUserApplications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Execute both queries in parallel for better performance
    const [data, total] = await Promise.all([
      this.applicationModel
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments({ user: userId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async processJobApplication(
    userId: string,
    jobData: { title: string; company: string; description: string },
  ) {
    const hash = this.generateJdHash(jobData.description);
    const existing = await this.findExistingApplication(userId, hash);

    if (existing) {
      return {
        isDuplicate: true,
        data: existing,
        message: 'You have already generated a CV for this job description.',
      };
    }

    return {
      isDuplicate: false,
      jdHash: hash,
    };
  }
}
