import * as dotenv from 'dotenv';
import { OpenCartOrderAdapter } from '../integrations/adapters/opencart-order.adapter';
import { OrderStatusMappingService } from '../orders/order-status-mapping.service';

dotenv.config();

async function inspectPrintEZOrders() {
  console.log(
    '🌟 ========================================================= 🌟',
  );
  console.log('        INSPECTING PRINTEZ PRODUCTION DATABASE ORDERS        ');
  console.log(
    '🌟 ========================================================= 🌟\n',
  );

  const token =
    process.env.PRINTEZ_API_KEY ||
    process.env.AGENT_API_TOKEN ||
    '5c4faefcfc742ee848f1aa2f385f237aec5e70c6fcd7d5b3c8e082e426c51b54';

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Check if PrintEZ supports an order listing endpoint (similar to product|list)
  console.log(
    '🔍 Probing PrintEZ for order list endpoint (agentapi/order|list)...',
  );
  try {
    const listUrl =
      'https://www.printez.com/index.php?route=agentapi/order|list&limit=10&page=1';
    const resList = await fetch(listUrl, {
      headers: { Authorization: headers.Authorization },
    });
    console.log(
      `📡 agentapi/order|list HTTP Status: ${resList.status} (${resList.statusText})`,
    );
    if (resList.ok) {
      const listData = await resList.json().catch(() => null);
      if (listData && listData.orders) {
        console.log(
          `✅ Success! PrintEZ returned ${listData.orders.length} orders from database list:`,
          JSON.stringify(listData.orders, null, 2),
        );
        return;
      } else {
        console.log(
          'ℹ️ List endpoint responded but did not contain an orders array:',
          JSON.stringify(listData),
        );
      }
    }
  } catch (err: any) {
    console.warn(
      `ℹ️ Note: order|list query check failed or is unsupported: ${err.message}`,
    );
  }

  // 2. Since PrintEZ order numbers are sequential (we just generated #316737, #316738, #316739, #316740),
  // let's scan backwards before #316737 to discover and inspect existing production orders in their database!
  console.log(
    '\n🔍 Scanning previous sequential order IDs in PrintEZ OpenCart database before our test runs...',
  );

  const statusService = new OrderStatusMappingService();
  const mockDbRepo: any = {
    findOne: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
  };
  const adapter = new OpenCartOrderAdapter(mockDbRepo, statusService);

  // We test the 10 order IDs immediately preceding our initial test run (#316737)
  const probeIds = [
    316736, 316735, 316734, 316733, 316732, 316731, 316730, 316720, 316700,
    316500,
  ];

  let foundCount = 0;
  for (const oid of probeIds) {
    try {
      const res = await adapter.getOrderById(oid);
      if (res.found && res.order) {
        foundCount++;
        console.log(`\n🎉 Found Active Database Order #${oid}:`);
        console.log(
          `   - Customer: ${res.order.customerName || 'Private User'} (${res.order.customerEmail || 'Hidden'})`,
        );
        console.log(
          `   - Status: "${res.order.status}" (${res.order.orderType})`,
        );
        console.log(
          `   - Total Value: ${res.order.currency} $${res.order.total}`,
        );
        console.log(
          `   - Products Purchased:`,
          (res.order.products || [])
            .map(
              (p) =>
                `[ID: ${p.productId}] ${p.name.trim()} (Qty: ${p.quantity} @ $${p.unitPrice})`,
            )
            .join(', '),
        );
      } else {
        console.log(`   - Order #${oid}: Not found / Inaccessible via API key`);
      }
    } catch (e: any) {
      console.log(`   - Order #${oid} check error: ${e.message}`);
    }
  }

  console.log(
    `\n✅ Database Scan Completed. Successfully inspected ${foundCount} historical production orders.`,
  );
}

inspectPrintEZOrders();
