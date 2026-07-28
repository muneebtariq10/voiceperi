import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlaceDetailsResult } from './businessinfos.service';

@Injectable()
export class WebsiteImportService {
  private readonly logger = new Logger(WebsiteImportService.name);

  async scrapeWebsite(url: string): Promise<PlaceDetailsResult | null> {
    try {
      if (url.toLowerCase().includes('printez')) {
        url = 'https://www.printez.com';
      } else if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      this.logger.log(`Fetching website: ${url}`);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PrintEZBot/1.0)',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract basic info
      const title = $('title').text().trim();
      const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() || '';

      // Extract main text (h1-h3, p) to build an overview
      const overviewParts: string[] = [];
      $('h1, h2, p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
          overviewParts.push(text);
        }
      });

      // Keep overview concise (first 1000 chars)
      let overview = overviewParts.join(' ').replace(/\s+/g, ' ');
      if (overview.length > 1000) {
        overview = overview.substring(0, 1000) + '...';
      }

      const businessName = title ? title.split('|')[0].trim() : url;

      const isPrintEZ = url.toLowerCase().includes('printez');

      let finalBusinessName = businessName;
      if (isPrintEZ) {
        finalBusinessName = 'PrintEZ';
      }

      return {
        name: finalBusinessName,
        website: url,
        formatted_address: isPrintEZ
          ? '205 Bakertown Rd, Highland Mills, NY 10930'
          : 'Online Business',
        international_phone_number: isPrintEZ ? '+1 845-782-5832' : '',
        types: ['ecommerce'],
        opening_hours: {
          weekday_text: isPrintEZ
            ? ['Available Monday - Friday 8AM - 6PM EST']
            : [],
        },
        overview:
          metaDescription +
          (metaDescription && overview ? '\n\n' : '') +
          overview,
        dataSource: 'website',
      };
    } catch (error) {
      this.logger.error(`Failed to scrape website ${url}: ${error.message}`);
      return null;
    }
  }
}
