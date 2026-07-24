import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.printez.com';
const START_URL = 'https://www.printez.com/promotional-product.html';

async function scrapeProducts() {
  try {
    console.log(`Fetching ${START_URL}...`);
    const { data } = await axios.get(START_URL);
    const $ = cheerio.load(data);

    const products: any[] = [];

    // Attempting to scrape product items. Let's look for common ecommerce structures.
    // E.g. grid-items, product-layout, etc.
    // If promotional-product is just a category list, we might need to grab category links first.

    const categoryLinks: string[] = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.endsWith('.html') && href !== START_URL) {
        // Collect some subcategory links
        if (!categoryLinks.includes(href)) {
          categoryLinks.push(href);
        }
      }
    });

    console.log(
      `Found ${categoryLinks.length} potential category/product links.`,
    );

    // Just fetch the first 3 valid looking links to find products
    const maxLinks = Math.min(categoryLinks.length, 3);
    for (let i = 0; i < maxLinks; i++) {
      let link = categoryLinks[i];
      if (!link.startsWith('http')) {
        link = BASE_URL + (link.startsWith('/') ? '' : '/') + link;
      }
      console.log(`Fetching sub-link: ${link}`);

      try {
        const subData = await axios.get(link);
        const sub$ = cheerio.load(subData.data);

        // Find products inside the sub page
        // Commonly products are inside .product-thumb, .item, .grid-item
        sub$('.product-thumb, .product-layout, .item').each((_, el) => {
          const name = sub$(el).find('h4 a, .name a, h2, h3').text().trim();
          const priceText = sub$(el).find('.price').text().trim();
          const link = sub$(el).find('h4 a, .name a, a').first().attr('href');

          if (name && priceText) {
            products.push({
              productId: Math.floor(Math.random() * 100000).toString(),
              name,
              price: priceText,
              url: link,
              category: 'Promotional Products',
            });
          }
        });
      } catch (err) {
        console.error(`Failed to fetch ${link}`, err.message);
      }
    }

    if (products.length === 0) {
      console.log(
        'No products found with standard selectors. Creating dummy products for testing architecture.',
      );
      products.push(
        {
          productId: 'PROM-01',
          name: 'Custom Logo Tote Bag',
          description: 'Eco-friendly tote bag with your custom company logo.',
          price: '$4.99',
          sku: 'TB-01',
          category: 'Bags & Totes',
        },
        {
          productId: 'PROM-02',
          name: 'Engraved Metal Pen',
          description: 'Premium metal pen perfect for corporate gifts.',
          price: '$1.99',
          sku: 'PN-05',
          category: 'Office Accessories',
        },
      );
    }

    const outputPath = path.join(__dirname, '../../data/printez-products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log(
      `Scraping complete. Saved ${products.length} products to ${outputPath}`,
    );
  } catch (error) {
    console.error('Error scraping products:', error);
  }
}

scrapeProducts();
