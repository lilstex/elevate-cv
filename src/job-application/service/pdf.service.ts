import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class PdfService {
  async generateCvPdf(
    data: any,
    profile: any,
    template: string = 'modern',
  ): Promise<Buffer> {
    try {
      // Resolve path to the EJS template
      const basePath = path.join(__dirname, '../../views');
      const templatePath = path.join(basePath, `standard.ejs`);

      // Render HTML using EJS and data
      const htmlContent = await ejs.renderFile(templatePath, {
        ai: data,
        user: profile,
        template: template, // 'modern' or 'corporate'
      });

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }
}
