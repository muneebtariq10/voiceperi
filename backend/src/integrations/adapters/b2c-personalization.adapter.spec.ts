import { Test, TestingModule } from '@nestjs/testing';
import { B2CPersonalizationAdapter } from './b2c-personalization.adapter';

describe('B2CPersonalizationAdapter', () => {
  let adapter: B2CPersonalizationAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [B2CPersonalizationAdapter],
    }).compile();

    adapter = module.get<B2CPersonalizationAdapter>(B2CPersonalizationAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a personalization studio session with valid design ID and edit URL', async () => {
      const productId = 'PROD-4021';
      const email = 'customer@test.com';

      const result = await adapter.createSession(productId, email, {
        companyName: 'Acme Corp',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.designId).toContain(`DSN-${productId}-`);
      expect(result.editUrl).toContain('https://www.printez.com/customize');
      expect(result.sessionToken).toContain('TOKEN-');
      expect(result.message).toContain(
        `We have generated your custom design workspace for product ${productId}`,
      );
    });

    it('should handle creation without optional parameters', async () => {
      const result = await adapter.createSession('GEN-008');

      expect(result.success).toBe(true);
      expect(result.designId).toContain('DSN-GEN-008-');
    });
  });

  describe('getEditSessionForPreviousDesign & duplicateDesign', () => {
    it('should duplicate a previous design and generate a fresh edit link for modification', async () => {
      const previousDesignId = 'DSN-CHECK-10029';
      const email = 'reorder@test.com';

      const result = await adapter.getEditSessionForPreviousDesign(
        previousDesignId,
        email,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.designId).toContain('DSN-CHECK-REV');
      expect(result.editUrl).toContain('mode=reorder_edit');
      expect(result.message).toContain(
        `Your previous design (${previousDesignId}) has been cloned into new workspace`,
      );
    });

    it('should directly duplicate a design via duplicateDesign method', async () => {
      const cloneResult = await adapter.duplicateDesign('DSN-FORM-8899');

      expect(cloneResult.success).toBe(true);
      expect(cloneResult.previousDesignId).toBe('DSN-FORM-8899');
      expect(cloneResult.newDesignId).toContain('DSN-FORM-REV');
      expect(cloneResult.editUrl).toContain('source_design=DSN-FORM-8899');
    });
  });

  describe('isAvailable', () => {
    it('should resolve to true confirming availability', async () => {
      const status = await adapter.isAvailable();
      expect(status).toBe(true);
    });
  });
});
