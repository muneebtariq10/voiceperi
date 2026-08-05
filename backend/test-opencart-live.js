/**
 * Live OpenCart API Verification Script
 * 
 * Run this directly from your terminal inside the `backend` directory:
 *   node test/test-opencart-live.js
 */

async function testOpenCartPayloads() {
  const token = process.env.PRINTEZ_API_KEY || '5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54';
  const baseUrl = 'https://www.printez.com/index.php?route=agentapi/order|insert';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const testEmail = 'salehahmedkhurram@gmail.com';

  const payload = {
    customer: {
      customer_id: 16667,
      firstname: 'Saleh',
      lastname: 'Ahmed',
      email: testEmail,
      telephone: '03234387187'
    },
    products: [
      {
        product_id: 24030, // Statement, Unlined (GEN0495)
        quantity: 1, // MUST BE 1 (represents 1 lot/package of the option tier below)
        price: 55.99,
        total: 55.99,
        options: [
          { name: '2 Part', value: '524748', product_option_id: 82750, product_option_value_id: 524748, type: 'select' },
          { name: '3 Part', value: '524753', product_option_id: 82751, product_option_value_id: 524753, type: 'select' }
        ],
        parts: '2 Part'
      }
    ],
    shipping_address: {
      firstname: 'Saleh', lastname: 'Ahmed',
      company: 'NVT',
      address_1: '388 N Phase 6 DHA',
      city: '54000', postcode: '54000', zone: 'Ohio',
      country_id: 223,
      shipping_method: 'Ground'
    },
    payment_address: {
      firstname: 'Saleh', lastname: 'Ahmed',
      company: 'NVT',
      address_1: '139 Hunza',
      city: '54000', postcode: '54000', zone: 'Ohio',
      country_id: 223,
      payment_method: 'Credit Card'
    },
    shipping_method: 'Ground',
    payment_method: 'Credit Card',
    ip: '198.51.100.42',
    user_agent: 'VoicePeri AI Telephony Concierge / PrintEZ Assistant',
    comment: 'Estimated Total: $55.99 (1 package of 100-unit option @ $55.99) | Company: NVT | Parts: 2 Part | Shipping Method: Ground | Payment Method: Credit Card',
    sub_total: 55.99,
    total: 55.99,
    totals: [
      { code: 'sub_total', title: 'Sub-Total', value: 55.99, sort_order: 1 },
      { code: 'total', title: 'Total', value: 55.99, sort_order: 2 }
    ]
  };

  console.log('================================================================================');
  console.log('🧪 TRANSMITTING LIVE TEST ORDER TO PRINTEZ OPENCART...');
  console.log('================================================================================');
  console.log(`Sending as new customer: Alexander Vance (${testEmail})`);

  try {
    const start = Date.now();
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const status = res.status;
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    console.log(`\n📨 [OPENCART LIVE API RESPONSE (Status ${status}) - Took ${Date.now() - start}ms]:`);
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));

    if (data && data.success && data.order) {
      console.log('\n================================================================================');
      console.log(`🎉 SUCCESS! Brand new Order #${data.order.order_id} was generated!`);
      console.log(`👉 Check Order #${data.order.order_id} in your OpenCart Admin Dashboard right now!`);
      console.log('================================================================================');
    }
  } catch (error) {
    console.error('❌ Error testing OpenCart API:', error.message);
  }
}

testOpenCartPayloads();
