import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.printez.com';

interface ScrapedProduct {
  productId: string;
  name: string;
  description: string;
  price: string;
  sku: string;
  category: string;
  url: string;
}

// Ignore utility and non-catalog pages
const IGNORED_PATHS = [
  '/account',
  '/login',
  '/logout',
  '/cart',
  '/checkout',
  '/contact',
  '/wishlist',
  '/compare',
  '/sitemap',
  '/blog',
  '/info',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

async function scrapeProducts() {
  console.log('🚀 Starting automated full-catalog PrintEZ scraper...');
  const productsMap = new Map<string, ScrapedProduct>();
  const visitedUrls = new Set<string>();
  const urlsToVisit: string[] = [
    BASE_URL,
    `${BASE_URL}/promotional-product.html`,
    `${BASE_URL}/tags.html`,
    `${BASE_URL}/service-repair-forms.html`,
  ];

  try {
    // Phase 1: Discover category links from the homepage
    console.log(`🌐 Discovering categories from homepage (${BASE_URL})...`);
    try {
      const homeResponse = await axios.get(BASE_URL, { timeout: 10000 });
      const $home = cheerio.load(homeResponse.data);

      $home('a').each((_, el) => {
        const href = $home(el).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http')
            ? href
            : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
          if (
            fullUrl.startsWith(BASE_URL) &&
            fullUrl.includes('.html') &&
            !IGNORED_PATHS.some((ignored) =>
              fullUrl.toLowerCase().includes(ignored),
            )
          ) {
            if (!urlsToVisit.includes(fullUrl) && urlsToVisit.length < 50) {
              urlsToVisit.push(fullUrl.split('#')[0]);
            }
          }
        }
      });
    } catch (err: unknown) {
      console.warn('⚠️ Could not connect to homepage for link discovery, continuing with starter seeds...');
    }

    console.log(`📋 Found ${urlsToVisit.length} catalog pages to index.`);

    // Phase 2: Crawl discovered pages & handle pagination
    for (let i = 0; i < urlsToVisit.length; i++) {
      const url = urlsToVisit[i];
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      console.log(
        `[${i + 1}/${urlsToVisit.length}] Indexing page: ${url}`,
      );
      try {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        const $ = cheerio.load(response.data);

        // Try to identify category heading
        let categoryName =
          $('h1').first().text().trim() ||
          $('.breadcrumb li:last-child').text().trim() ||
          'PrintEZ Catalog';
        categoryName = categoryName.replace(/\s+/g, ' ').trim();

        // Check for product cards on this page
        const productElements = $(
          '.product-thumb, .product-layout, .item, .grid-item',
        );

        productElements.each((_, el) => {
          const $el = $(el);

          // Clean duplicate titles by taking ONLY the first anchor/title element
          const titleElement = $el
            .find('.name a, h4 a, h2 a, h3 a')
            .first();
          const name = titleElement.text().replace(/\s+/g, ' ').trim();
          let productUrl = titleElement.attr('href') || url;
          if (!productUrl.startsWith('http')) {
            productUrl = `${BASE_URL}${productUrl.startsWith('/') ? '' : '/'}${productUrl}`;
          }

          const fullText = $el.text();
          const priceBlockText = $el.find('.price').text();

          // 1. Clean SKU / Item # extraction
          let sku = '';
          const skuMatch = fullText.match(
            /(?:Item\s*#|SKU|Model)\s*:?\s*([A-Z0-9-]+)/i,
          );
          if (skuMatch && skuMatch[1]) {
            sku = skuMatch[1].trim();
          }

          // 2. Clean Price extraction (e.g., "$0.13" instead of mashed string)
          let price = 'See website pricing';
          const priceMatch = (priceBlockText || fullText).match(
            /\$\d+(?:\.\d+)?/,
          );
          if (priceMatch) {
            price = priceMatch[0];
          }

          // Generate a unique product ID from SKU, URL ID, or name hash
          let productId = sku;
          if (!productId) {
            const idMatch =
              productUrl.match(/[?&]product_id=(\d+)/) ||
              productUrl.match(/\/(\d+)[^/]*$/);
            productId = idMatch
              ? idMatch[1]
              : Math.abs(hashCode(name)).toString();
          }

          if (name && !name.toLowerCase().includes('shopping cart')) {
            productsMap.set(productId, {
              productId,
              name,
              description: `PrintEZ product: ${name}. Section: ${categoryName}.`,
              price,
              sku: sku || productId,
              category: categoryName,
              url: productUrl,
            });
          }
        });

        // Discover pagination URLs (Page 2, 3, etc.) and append to queue if under limit
        $('.pagination a').each((_, el) => {
          const pageUrl = $(el).attr('href');
          if (
            pageUrl &&
            pageUrl.startsWith('http') &&
            !visitedUrls.has(pageUrl) &&
            urlsToVisit.length < 100
          ) {
            if (!urlsToVisit.includes(pageUrl)) {
              urlsToVisit.push(pageUrl);
            }
          }
        });
      } catch (err: unknown) {
        console.warn(`⚠️ Skipped page ${url}`);
      }
    }

    const products = Array.from(productsMap.values());
    console.log(
      `✅ Successfully indexed ${products.length} catalog products with clean prices and SKUs!`,
    );

    const outputPath = path.join(__dirname, '../../data/printez-products.json');
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log(`💾 Scraped catalog saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error during scraping:', error);
  }
}

scrapeProducts();
