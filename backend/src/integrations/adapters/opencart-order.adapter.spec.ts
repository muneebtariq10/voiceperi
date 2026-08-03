import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OpenCartOrderAdapter } from './opencart-order.adapter';
import { Order } from '../../entities/order';
import { OrderStatusMappingService } from '../../orders/order-status-mapping.service';

// Backup global fetch so we can mock and restore cleanly
const originalFetch = global.fetch;

describe('OpenCartOrderAdapter', () => {
  let adapter: OpenCartOrderAdapter;
  let mockOrderRepository: Record<string, jest.Mock>;
  let statusMappingService: OrderStatusMappingService;

  beforeEach(async () => {
    mockOrderRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenCartOrderAdapter,
        OrderStatusMappingService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    adapter = module.get<OpenCartOrderAdapter>(OpenCartOrderAdapter);
    statusMappingService = module.get<OrderStatusMappingService>(
      OrderStatusMappingService,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getOrderById', () => {
    it('should query live PrintEZ API and translate order JSON when server returns 200 OK', async () => {
      const liveOrderData = {
        success: true,
        order: {
          order_id: 10500,
          type: 'Online',
          order_status_id: 2,
          order_status: 'Processing',
          total: 125.5,
          currency_code: 'USD',
          customer: {
            firstname: 'Alice',
            lastname: 'Wonder',
            email: 'alice@test.com',
            telephone: '555-0001',
          },
          products: [
            {
              product_id: 4021,
              name: 'Laser Checks',
              quantity: 2,
              price: 50,
              total: 100,
            },
          ],
          history: [],
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(liveOrderData),
      } as any);

      const result = await adapter.getOrderById(10500);

      expect(result.found).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order?.orderId).toBe(10500);
      expect(result.order?.customerName).toBe('Alice Wonder');
      expect(result.order?.total).toBe(125.5);
      expect(mockOrderRepository.findOne).not.toHaveBeenCalled();
    });

    it('should seamlessly fallback to local database query when live API returns 404', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

      const mockDbOrder = {
        externalOrderId: 9999,
        orderType: 'Online',
        statusName: 'Completed',
        grandTotal: 85,
        currencyCode: 'USD',
        customerFirstName: 'Local',
        customerLastName: 'User',
        customerEmail: 'local@test.com',
        products: [],
        history: [],
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockDbOrder);

      const result = await adapter.getOrderById('9999');

      expect(result.found).toBe(true);
      expect(result.order?.orderId).toBe(9999);
      expect(result.order?.customerName).toBe('Local User');
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { externalOrderId: 9999 } }),
      );
    });
  });

  describe('createOrder (agentapi/order|insert)', () => {
    it('should post new order payload to live API and return created order details on HTTP 201', async () => {
      const createdPayload = {
        success: true,
        order: {
          order_id: 300100,
          type: 'Online',
          order_status_id: 0,
          order_status: null, // Test pending translation logic
          total: 0,
          currency_code: 'USD',
          customer: {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@test.com',
            telephone: '555-1234',
          },
          products: [
            { product_id: 24019, name: 'Purchase Order Book', quantity: 1 },
          ],
          history: [],
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(createdPayload),
      } as any);

      const res = await adapter.createOrder({
        customer: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@test.com',
          telephone: '555-1234',
        },
        products: [{ product_id: 24019, quantity: 1 }],
      });

      expect(res.success).toBe(true);
      expect(res.order?.orderId).toBe(300100);
      expect(res.order?.status).toBe('Pending (Awaiting Payment)');
      expect(res.message).toContain('300100');
    });

    it('should capture and return structured error messages when product options are invalid', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          error: {
            code: 'invalid_product',
            message: 'product_id out of stock or requires mandatory options',
          },
        }),
      } as any);

      const res = await adapter.createOrder({
        customer: {
          firstname: 'Fail',
          lastname: 'Test',
          email: 'fail@test.com',
          telephone: '555-0000',
        },
        products: [{ product_id: 4021, quantity: 1 }],
      });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('invalid_product');
      expect(res.message).toContain('mandatory options');
    });
  });

  describe('reorderPastOrder (agentapi/order|reorder)', () => {
    it('should clone source order, re-price items, and report any skipped discontinued items', async () => {
      const reorderResponse = {
        success: true,
        order: {
          order_id: 300101,
          type: 'Reorder',
          reorder_id: 300100,
          source_order_id: 300100,
          total: 45.0,
          currency_code: 'USD',
          products: [
            {
              product_id: 24019,
              name: 'Purchase Order Book',
              quantity: 1,
              price: 45.0,
            },
          ],
          skipped_products: [{ product_id: 999, quantity: 5 }],
          history: [],
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(reorderResponse),
      } as any);

      const res = await adapter.reorderPastOrder(
        300100,
        'Automated reorder clone test',
      );

      expect(res.success).toBe(true);
      expect(res.order?.orderId).toBe(300101);
      expect(res.order?.source_order_id).toBe(300100);
      expect(res.order?.skipped_products).toHaveLength(1);
      expect(res.message).toContain('300101');
    });
  });
});
