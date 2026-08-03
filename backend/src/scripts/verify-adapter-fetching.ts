import * as dotenv from 'dotenv';
import { OpenCartOrderAdapter } from '../integrations/adapters/opencart-order.adapter';
import { OrderStatusMappingService } from '../orders/order-status-mapping.service';

dotenv.config();

/**
 * Verification script demonstrating that OpenCartOrderAdapter directly queries
 * and fetches live order records from the PrintEZ OpenCart database server.
 */
async function verifyAdapterLiveFetching() {
  console.log(
    '🌟 ========================================================= 🌟',
  );
  console.log('    VERIFYING REAL-TIME ORDER FETCHING FROM PRINTEZ DB       ');
  console.log(
    '🌟 ========================================================= 🌟\n',
  );

  // Create real instances of our adapter and mapping service
  const statusService = new OrderStatusMappingService();

  // Provide a mock repository that always returns null for findOne to prove that
  // successful lookups are coming strictly from PrintEZ live production DB, NOT local tables!
  const mockDbRepo: any = {
    findOne: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
  };

  const adapter = new OpenCartOrderAdapter(mockDbRepo, statusService);

  // We test fetching Order #316737 and #316738, which exist in PrintEZ's live production database
  const targetOrders = [316737, 316738];

  for (const orderId of targetOrders) {
    console.log(`\n🔍 Calling adapter.getOrderById(${orderId})...`);
    const startTime = Date.now();
    try {
      const result = await adapter.getOrderById(orderId);
      const duration = Date.now() - startTime;

      if (result.found && result.order) {
        console.log(
          `✅ [HTTP 200 - ${duration}ms] Successfully fetched Order #${orderId} directly from PrintEZ Live DB!`,
        );
        console.log(`📋 Translated Order Details for AI Concierge:`);
        console.log(`   - Order ID: #${result.order.orderId}`);
        console.log(
          `   - Customer Name: ${result.order.customerName || 'N/A'}`,
        );
        console.log(`   - Customer Email: ${result.order.customerEmail}`);
        console.log(`   - Status Name: "${result.order.status}"`);
        console.log(
          `   - Mapped Status Message: "${result.order.statusMessage}"`,
        );
        console.log(
          `   - Order Type: ${result.order.orderType} ${result.order.isReorder ? `(Reorder of #${result.order.reorderId})` : ''}`,
        );
        console.log(
          `   - Grand Total: ${result.order.currency} $${result.order.total}`,
        );
        console.log(
          `   - Product Line Items:`,
          JSON.stringify(result.order.products, null, 2),
        );
      } else {
        console.warn(
          `❌ Order #${orderId} not found in PrintEZ DB:`,
          result.message,
        );
      }
    } catch (err: any) {
      console.error(
        `❌ Error querying PrintEZ DB for Order #${orderId}: ${err.message}`,
      );
    }
  }

  // Also test availability check method against live server
  console.log(
    `\n🩺 Testing adapter.isAvailable() against live PrintEZ database endpoint...`,
  );
  const isUp = await adapter.isAvailable();
  console.log(
    `📡 PrintEZ Live Database Connection Status: ${isUp ? '✅ ACTIVE & ONLINE' : '❌ OFFLINE'}`,
  );

  console.log(
    '\n🌟 ========================================================= 🌟',
  );
  console.log('       LIVE PRINTEZ DATABASE FETCH VERIFICATION COMPLETE     ');
  console.log(
    '🌟 ========================================================= 🌟\n',
  );
}

verifyAdapterLiveFetching();
