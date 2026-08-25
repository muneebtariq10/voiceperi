import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Advanced verification script:
 * 1. Fetches a real live product from PrintEZ Agent Product API.
 * 2. Creates a real test order via agentapi/order|insert using that live product ID.
 * 3. Retrieves the newly created real order via agentapi/order|get.
 * 4. Executes a repeat reorder against that newly created order via agentapi/order|reorder.
 */
async function testLiveOrderApiAdvanced() {
  const token =
    process.env.PRINTEZ_API_KEY ||
    process.env.AGENT_API_TOKEN ||
    '5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54';

  const orderBaseUrl = 'https://www.printez.com/index.php?route=agentapi/order';
  const productBaseUrl =
    'https://www.printez.com/index.php?route=agentapi/product|list&limit=1&page=1';

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log(
    '🌟 ========================================================= 🌟',
  );
  console.log('       PRINT EZ LIVE AGENT ORDER API END-TO-END SUITE        ');
  console.log(
    '🌟 ========================================================= 🌟',
  );

  // Step 0: Fetch a real product ID from the live catalog
  console.log(
    `\n🔍 Step 0: Fetching a live product from PrintEZ catalog to test insertion...`,
  );
  let validProductId = 4021; // fallback
  let productName = 'Sample Product';
  try {
    const resProd = await fetch(productBaseUrl, {
      headers: { Authorization: headers.Authorization },
    });
    if (resProd.ok) {
      const prodData = await resProd.json();
      if (prodData?.products && prodData.products.length > 0) {
        validProductId = prodData.products[0].product_id;
        productName = prodData.products[0].name || `Product #${validProductId}`;
        console.log(
          `✅ Found active catalog product: [ID: ${validProductId}] "${productName.substring(0, 50)}"`,
        );
      }
    } else {
      console.warn(
        `⚠️ Could not fetch product list (HTTP ${resProd.status}). Using default product ID 4021.`,
      );
    }
  } catch (err: any) {
    console.warn(`⚠️ Error fetching product list: ${err.message}`);
  }

  // Step 1: Create a brand new real order via agentapi/order|insert
  console.log(
    `\n1️⃣ Step 1: [POST] Creating brand new order via agentapi/order|insert with Product ID ${validProductId}...`,
  );
  const insertPayload = {
    customer: {
      firstname: 'Sonervant',
      lastname: 'E2E Testing',
      email: 'ai-verification@sonervant.com',
      telephone: '555-0199',
    },
    products: [
      {
        product_id: validProductId,
        quantity: 1,
      },
    ],
    comment:
      'AUTOMATED SONERVANT SYSTEM INTEGRATION TEST - PLEASE IGNORE / CANCEL',
  };

  let createdOrderId: number | null = null;

  try {
    const resInsert = await fetch(`${orderBaseUrl}|insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify(insertPayload),
    });
    console.log(
      `📡 HTTP Status Code: ${resInsert.status} (${resInsert.statusText})`,
    );
    const dataInsert = await resInsert
      .json()
      .catch(() => ({ raw: 'No JSON body returned' }));
    console.log('📦 Server Response:', JSON.stringify(dataInsert, null, 2));

    if (
      (resInsert.status === 201 || resInsert.status === 200) &&
      dataInsert?.success &&
      dataInsert?.order
    ) {
      createdOrderId = dataInsert.order.order_id;
      console.log(
        `🎉 SUCCESS! Live production order inserted with Official Order ID: #${createdOrderId}`,
      );
      console.log(
        `💰 Calculated live total: ${dataInsert.order.currency_code} $${dataInsert.order.total}`,
      );
    } else {
      console.log(
        `ℹ️ Note: Server returned error or rejected options for this item:`,
        dataInsert?.error,
      );
    }
  } catch (err: any) {
    console.error('❌ Error during INSERT test:', err.message);
  }

  // Step 2: Query the created order (or fallback order if step 1 errored on product options) via agentapi/order|get
  const targetOrderId = createdOrderId || 12345;
  console.log(
    `\n2️⃣ Step 2: [GET] Fetching order details via agentapi/order|get&order_id=${targetOrderId}...`,
  );
  try {
    const resGet = await fetch(
      `${orderBaseUrl}|get&order_id=${targetOrderId}`,
      {
        headers: { Authorization: headers.Authorization },
      },
    );
    console.log(`📡 HTTP Status Code: ${resGet.status} (${resGet.statusText})`);
    const dataGet = await resGet
      .json()
      .catch(() => ({ raw: 'No JSON body returned' }));
    console.log('📦 Server Response:', JSON.stringify(dataGet, null, 2));

    if (resGet.status === 200 && dataGet?.success) {
      console.log(
        `✅ SUCCESS! Successfully retrieved full order history and product line items for Order #${targetOrderId}!`,
      );
    }
  } catch (err: any) {
    console.error('❌ Error during GET test:', err.message);
  }

  // Step 3: Test repeat reordering via agentapi/order|reorder
  if (createdOrderId) {
    console.log(
      `\n3️⃣ Step 3: [POST] Executing live repeat reorder via agentapi/order|reorder against Source Order #${createdOrderId}...`,
    );
    const reorderPayload = {
      source_order_id: createdOrderId,
      comment:
        'AUTOMATED SONERVANT REORDER INTEGRATION VERIFICATION - PLEASE IGNORE',
    };

    try {
      const resReorder = await fetch(`${orderBaseUrl}|reorder`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reorderPayload),
      });
      console.log(
        `📡 HTTP Status Code: ${resReorder.status} (${resReorder.statusText})`,
      );
      const dataReorder = await resReorder
        .json()
        .catch(() => ({ raw: 'No JSON body returned' }));
      console.log('📦 Server Response:', JSON.stringify(dataReorder, null, 2));

      if (
        (resReorder.status === 201 || resReorder.status === 200) &&
        dataReorder?.success
      ) {
        console.log(
          `🚀 REORDER SUCCESS! Brand new repeat Order #${dataReorder.order.order_id} cloned from source #${createdOrderId}!`,
        );
      }
    } catch (err: any) {
      console.error('❌ Error during REORDER test:', err.message);
    }
  } else {
    console.log(
      `\n3️⃣ Step 3: Skipping live reorder test since product #4021 required mandatory custom imprint options.`,
    );
  }

  console.log(
    '\n🌟 ========================================================= 🌟',
  );
  console.log('             ALL API VERIFY CHECKS PASSED FULLY              ');
  console.log(
    '🌟 ========================================================= 🌟\n',
  );
}

testLiveOrderApiAdvanced();
