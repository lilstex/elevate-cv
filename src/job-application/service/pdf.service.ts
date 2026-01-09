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
      await page.setContent(htmlContent, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
      });

      // Force a small wait to ensure fonts are rendered
      await page.evaluateHandle('document.fonts.ready');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `
        <div style="font-family: 'Inter', sans-serif; font-size: 9px; width: 100%; display: flex; justify-content: space-between; padding: 0 40px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 5px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        headerTemplate: '<div></div>',
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }
}
