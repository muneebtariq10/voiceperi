/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { PersonalizationService } from './personalization.service';
import { B2CPersonalizationAdapter } from '../integrations/adapters';

describe('PersonalizationService', () => {
  let service: PersonalizationService;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const mockMailer = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalizationService,
        B2CPersonalizationAdapter,
        { provide: MailerService, useValue: mockMailer },
      ],
    }).compile();

    service = module.get<PersonalizationService>(PersonalizationService);
    mailerService = module.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handlePersonalizationRequest', () => {
    it('should handle Scenario 1: Brand new custom design request and dispatch customer confirmation email', async () => {
      const result = await service.handlePersonalizationRequest({
        productName: 'Custom Laser Checks',
        productId: '4021',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customizationNotes: 'Please print Acme Corp logo',
      });

      expect(result.success).toBe(true);
      expect(result.designId).toContain('DSN-4021-');
      expect(result.editUrl).toContain(
        'https://www.printez.com/configurator.php?skuId=4021-1&productId=4021',
      );
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@example.com',
          subject: expect.stringContaining('Custom Laser Checks'),
        }),
      );
    });

    it('should handle Scenario 3: Modified reorder request using previous order/design ID', async () => {
      const result = await service.handlePersonalizationRequest({
        productName: 'Purchase Order Books',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        isModifiedReorder: true,
        previousOrderOrDesignId: 'DSN-GEN008-888',
      });

      expect(result.success).toBe(true);
      expect(result.designId).toContain('DSN-GEN008-REV');
      expect(result.message).toContain('duplicated your previous design');
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should handle email service errors gracefully without failing the overall customization request', async () => {
      mailerService.sendMail = jest
        .fn()
        .mockRejectedValueOnce(new Error('SMTP connection failure'));

      const result = await service.handlePersonalizationRequest({
        productName: 'Envelopes',
        customerName: 'Error Test',
        customerEmail: 'fail@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.designId).toBeDefined();
    });
  });
});
