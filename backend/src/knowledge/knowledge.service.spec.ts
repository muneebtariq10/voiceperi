import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeService } from './knowledge.service';
import { PrintEZKnowledgeAdapter } from '../integrations/adapters';

describe('KnowledgeService', () => {
  let service: KnowledgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeService, PrintEZKnowledgeAdapter],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleKnowledgeQuery', () => {
    it('should successfully delegate FAQ inquiries and return matched policy topics', async () => {
      const result = await service.handleKnowledgeQuery({
        question:
          'Are your checks compatible with QuickBooks accounting software?',
      });

      expect(result.found).toBe(true);
      expect(result.topic).toBe('MICR Ink & Software Compatibility');
      expect(result.answer).toContain('100% scanning capability');
    });

    it('should accept category or topic input directly', async () => {
      const result = await service.handleKnowledgeQuery({
        category: 'shipping time',
      });

      expect(result.found).toBe(true);
      expect(result.topic).toBe('Shipping & Production Turnaround');
      expect(result.referenceUrl).toBe(
        'https://www.printez.com/shipping-policy.html',
      );
    });

    it('should handle unformatted or vague support requests cleanly', async () => {
      const result = await service.handleKnowledgeQuery({
        question: 'Can I pay in gold doubloons?',
      });

      expect(result.found).toBe(true);
      expect(result.topic).toBe('General Support Inquiry');
      expect(result.answer).toContain('orders@printez.com');
    });
  });
});
