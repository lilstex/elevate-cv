import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ApplicationHistory,
  ApplicationHistorySchema,
} from './schema/application-history.schema';
import { ApplicationController } from './controller/application.controller';
import { ApplicationService } from './service/application.service';
import { OpenAIService } from './service/openai.service';
import { PdfService } from './service/pdf.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationHistory.name, schema: ApplicationHistorySchema },
    ]),
    UserModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, OpenAIService, PdfService],
})
export class JobApplicationModule {}
