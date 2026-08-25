/**
 * Sonervant Shopify Integration — End-to-End Test
 * 
 * This script performs a full E2E test:
 * 1. Authenticates using Client Credentials
 * 2. Fetches real products from the store
 * 3. Creates a Draft Order with a REAL product variant
 * 4. Verifies the Draft Order was created and prints the invoice URL
 */

async function runE2ETest() {
  const storeUrl = process.env.SHOPIFY_STORE_URL || 'nwp1cg-ft.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID || '';
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || '';

  console.log('═══════════════════════════════════════════════');
  console.log('  Sonervant Shopify Integration — E2E Test');
  console.log('═══════════════════════════════════════════════');
  console.log(`Store: ${storeUrl}\n`);

  // ─── STEP 1: Authenticate ────────────────────────────────────────
  console.log('STEP 1: Generating access token via Client Credentials...');
  let accessToken;
  try {
    const tokenRes = await fetch(`https://${storeUrl}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('❌ Token generation FAILED:', JSON.stringify(tokenData));
      return;
    }
    accessToken = tokenData.access_token;
    console.log('✅ Access token generated successfully!\n');
  } catch (err) {
    console.error('❌ Token generation error:', err.message);
    return;
  }

  const graphqlUrl = `https://${storeUrl}/admin/api/2024-01/graphql.json`;

  // Helper: execute GraphQL
  async function gql(query, variables = {}) {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    return res.json();
  }

  // ─── STEP 2: Fetch real products ─────────────────────────────────
  console.log('STEP 2: Fetching products from your Shopify store...');
  const productsQuery = `
    query {
      products(first: 5) {
        edges {
          node {
            id
            title
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  const productsData = await gql(productsQuery);
  if (productsData.errors) {
    console.error('❌ Failed to fetch products:', JSON.stringify(productsData.errors, null, 2));
    return;
  }

  const products = productsData.data?.products?.edges || [];
  if (products.length === 0) {
    console.log('⚠️  No products found in the store. Cannot test Draft Order creation.');
    console.log('    Please add at least one product to your test Shopify store.');
    return;
  }

  console.log(`✅ Found ${products.length} product(s) in your store:\n`);
  products.forEach((p, i) => {
    const variants = p.node.variants?.edges || [];
    console.log(`  ${i + 1}. ${p.node.title}`);
    variants.forEach(v => {
      console.log(`     └─ Variant: "${v.node.title}" | Price: $${v.node.price} | GID: ${v.node.id}`);
    });
  });

  // Pick the first available variant for testing
  const firstProduct = products[0].node;
  const firstVariant = firstProduct.variants?.edges?.[0]?.node;
  if (!firstVariant) {
    console.error('❌ No variants found on the first product. Cannot test.');
    return;
  }

  console.log(`\n📦 Using product: "${firstProduct.title}" | Variant: "${firstVariant.title}" ($${firstVariant.price})\n`);

  // ─── STEP 3: Create a Draft Order ────────────────────────────────
  console.log('STEP 3: Creating Shopify Draft Order...');
  const draftOrderMutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
          status
          totalPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const draftOrderVars = {
    input: {
      note: 'Sonervant E2E Test — AI voice order placed via phone call',
      email: 'test-customer@voiceperi.com',
      lineItems: [{
        variantId: firstVariant.id,
        quantity: 1,
      }],
      shippingAddress: {
        address1: '123 Test Street',
        city: 'New York',
        provinceCode: 'NY',
        zip: '10001',
        countryCode: 'US',
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  };

  const draftOrderData = await gql(draftOrderMutation, draftOrderVars);

  if (draftOrderData.errors) {
    console.error('❌ GraphQL errors:', JSON.stringify(draftOrderData.errors, null, 2));
    return;
  }

  const userErrors = draftOrderData.data?.draftOrderCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    console.error('❌ Draft Order user errors:', JSON.stringify(userErrors, null, 2));
    return;
  }

  const draftOrder = draftOrderData.data?.draftOrderCreate?.draftOrder;
  console.log('✅ Draft Order created SUCCESSFULLY!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('  DRAFT ORDER DETAILS');
  console.log('═══════════════════════════════════════════════');
  console.log(`  ID:          ${draftOrder.id}`);
  console.log(`  Name:        ${draftOrder.name}`);
  console.log(`  Status:      ${draftOrder.status}`);
  console.log(`  Total:       $${draftOrder.totalPrice}`);
  console.log(`  Invoice URL: ${draftOrder.invoiceUrl}`);
  console.log('═══════════════════════════════════════════════\n');

  console.log('🎉 END-TO-END TEST PASSED! The full Shopify integration works:');
  console.log('   1. ✅ Token generation (Client Credentials)');
  console.log('   2. ✅ Product catalog query');
  console.log('   3. ✅ Draft Order creation with real product');
  console.log('   4. ✅ Invoice URL generated for customer payment');
  console.log('\nThis Draft Order is now visible in your Shopify Admin → Orders → Drafts');
}

runE2ETest().catch(err => console.error('Fatal error:', err));
