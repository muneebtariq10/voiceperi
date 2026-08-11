require('dotenv').config();

const TOKEN =
  process.env.PRINTEZ_API_KEY ||
  '5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54';
const HEADERS = { Authorization: `Bearer ${TOKEN}` };
const BASE = 'https://www.printez.com/index.php?route=agentapi';
const LOCAL = 'http://localhost:3000/api';

// ─────────────────────────────────────────────
// 1. LIST PRODUCTS  (hits PrintEZ directly)
// ─────────────────────────────────────────────
async function testListProducts() {
  console.log('\n=== 1. LIST PRODUCTS (PrintEZ live API) ===');
  const res = await fetch(`${BASE}/product|list&limit=5&page=1`, {
    headers: HEADERS,
  });
  const data = await res.json();
  const products = data.products || [];
  console.log(`Found ${products.length} products on this page.`);
  products.slice(0, 3).forEach((p) => {
    // PrintEZ returns name inside several possible keys
    const name = p.name || p.name_en || p.title || '(no name field)';
    console.log(`  - [${p.product_id}] ${name} — $${p.price}`);
    // Print all keys so we can see what the API actually returns
    if (products.indexOf(p) === 0) {
      console.log('  Raw keys for first product:', Object.keys(p).join(', '));
    }
  });
  return products[0];
}

// ─────────────────────────────────────────────
// 2. GET ORDER  (hits PrintEZ directly)
// ─────────────────────────────────────────────
async function testGetOrder(orderId) {
  console.log(`\n=== 2. GET ORDER #${orderId} (PrintEZ live API) ===`);
  const res = await fetch(`${BASE}/order|get&order_id=${orderId}`, {
    headers: HEADERS,
  });
  const data = await res.json();
  if (data.success) {
    const o = data.order;
    console.log(`  Order #${o.order_id} | Status: ${o.order_status}`);
    console.log(
      `  Customer: ${o.customer?.firstname} ${o.customer?.lastname} (${o.customer?.email})`,
    );
    console.log(`  Shipping method: ${o.shipping?.method}`);
    console.log(`  Total: $${o.total}`);
    console.log(
      '  Totals breakdown:',
      o.totals?.map((t) => `${t.title}: $${t.value}`).join(' | '),
    );
  } else {
    console.log('  Order not found:', JSON.stringify(data));
  }
  return data.order;
}

// ─────────────────────────────────────────────
// 3. LOOKUP ORDER  (hits your local NestJS backend)
// ─────────────────────────────────────────────
async function testLookupOrder() {
  console.log('\n=== 3. LOOKUP ORDER via local backend (POST /api/orders/lookup) ===');
  const res = await fetch(`${LOCAL}/orders/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: '310000',
      customerEmail: 'admin@peninsulavisioncare.com',
    }),
  });
  const data = await res.json();
  console.log('  Backend Response:', JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────────
// 4. PLACE / REORDER  (hits your local NestJS backend)
//    This exercises the full AI pipeline including Dry-Run mode
// ─────────────────────────────────────────────
async function testReorder(product) {
  console.log('\n=== 4. REORDER via local backend (POST /api/orders/reorder) ===');
  console.log('    (PRINTEZ_API_MODE=test → no live orders will be created!)');

  const productName =
    product?.name || product?.name_en || product?.title || 'Business Checks';
  const productId = String(product?.product_id || '25717');

  const body = {
    productId,
    productName,
    quantity: 1,
    customerEmail: 'salehahmedkhurram@gmail.com',
    customerName: 'Saleh Ahmed',
    customerPhone: '03234387187',
    previousOrderId: '310000',
    streetAddress: '139 Hunza',
    city: 'New York',
    state: 'New York',
    zipCode: '10001',
    shippingAddress: '139 Hunza, New York, NY 10001',
    shippingMethod: 'Ground',
    paymentMethod: 'Credit Card (Via Checkout Link)',
  };

  console.log('  Payload being sent:', JSON.stringify(body, null, 2));

  const res = await fetch(`${LOCAL}/orders/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('\n  Backend Response:', JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────────
// MAIN RUNNER
// ─────────────────────────────────────────────
async function run() {
  try {
    const firstProduct = await testListProducts();
    await testGetOrder(310000);
    await testLookupOrder();
    await testReorder(firstProduct);
    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.error(err.stack);
  }
}

run();
