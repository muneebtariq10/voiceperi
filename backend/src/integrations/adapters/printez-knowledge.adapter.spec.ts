import { Test, TestingModule } from '@nestjs/testing';
import { PrintEZKnowledgeAdapter } from './printez-knowledge.adapter';

describe('PrintEZKnowledgeAdapter', () => {
  let adapter: PrintEZKnowledgeAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrintEZKnowledgeAdapter],
    }).compile();

    adapter = module.get<PrintEZKnowledgeAdapter>(PrintEZKnowledgeAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('queryKnowledge', () => {
    it('should correctly match shipping and turnaround questions', async () => {
      const result = await adapter.queryKnowledge(
        'How long will shipping and turnaround take?',
      );

      expect(result.found).toBe(true);
      expect(result.topic).toBe('Shipping & Production Turnaround');
      expect(result.answer).toContain(
        'Standard custom check and business form production takes 24 to 48 business hours',
      );
      expect(result.referenceUrl).toBe(
        'https://www.printez.com/shipping-policy.html',
      );
    });

    it('should correctly match MICR ink and QuickBooks compatibility inquiries', async () => {
      const result = await adapter.queryKnowledge(
        'Are these checks compatible with quickbooks and do they use micr ink?',
      );

      expect(result.found).toBe(true);
      expect(result.topic).toBe('MICR Ink & Software Compatibility');
      expect(result.answer).toContain(
        'exceeds federal Bank Service (ANSI) standards',
      );
    });

    it('should correctly match logo and graphic formatting inquiries', async () => {
      const result = await adapter.queryKnowledge(
        'Can you print my holographic corporate logo on custom laser checks?',
      );

      expect(result.found).toBe(true);
      expect(result.topic).toBe('Logo Uploads & Graphic Formatting');
      expect(result.answer).toContain('logo');
    });

    it('should return friendly general support guidance when no exact keywords match', async () => {
      const result = await adapter.queryKnowledge(
        'What is the daily recipe for making spaghetti and meatballs?',
      );

      expect(result.found).toBe(true);
      expect(result.topic).toBe('General Support Inquiry');
      expect(result.answer).toContain('orders@printez.com');
      expect(result.referenceUrl).toBe('https://www.printez.com/faq.html');
    });

    it('should return prompt for input on empty queries', async () => {
      const result = await adapter.queryKnowledge('   ');

      expect(result.found).toBe(false);
      expect(result.topic).toBe('General Policy');
    });
  });

  describe('isAvailable', () => {
    it('should confirm instant runtime availability', async () => {
      const status = await adapter.isAvailable();
      expect(status).toBe(true);
    });
  });
});
