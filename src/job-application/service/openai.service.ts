import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

// Define the schema the AI MUST follow
const CvResponseSchema = z.object({
  professionalSummary: z.string(),
  refinedExperience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      highlights: z.array(z.string()), // Targeted bullet points
    }),
  ),
  relevantSkills: z.array(z.string()),
  coverLetter: z.string(),
});

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async generateTailoredContent(masterProfile: any, jobDescription: string) {
    const prompt = `
      You are an expert Technical Recruiter. 
      TASK: Map the User's Master Profile to the provided Job Description (JD).
      
      CONSTRAINTS:
      1. Rewrite experience bullet points using the X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
      2. Ensure the CV content is optimized for Applicant Tracking Systems (ATS).
      3. The Cover Letter should be professional, under 300 words, and highlight specific alignment with the JD.
      4. Do not lie; only use skills and experiences present in the Master Profile.
      
      USER MASTER PROFILE:
      ${JSON.stringify(masterProfile)}

      JOB DESCRIPTION:
      ${jobDescription}
    `;

    const response = await this.openai.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career coach and ATS expert.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: zodResponseFormat(CvResponseSchema, 'cv_output'),
    });

    return response.choices[0].message.parsed;
  }
}
