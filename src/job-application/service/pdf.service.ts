import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class PdfService {
  async generateCvPdf(
    data: any,
    profile: any,
    templateName: string = 'standard-chronological',
  ): Promise<Buffer> {
    try {
      // Resolve path to the EJS template
      const basePath = path.join(__dirname, '../../views');
      const templatePath = path.join(basePath, `${templateName}.ejs`);

      // Render HTML using EJS and data
      const htmlContent = await ejs.renderFile(templatePath, {
        ai: data,
        user: profile,
      });

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }
}
