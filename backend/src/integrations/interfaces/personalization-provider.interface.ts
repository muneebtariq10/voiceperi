/**
 * IPersonalizationProvider — Interface for communicating with third-party B2C design systems.
 *
 * Capabilities:
 * - Open previous design
 * - Duplicate design (for modified reorders)
 * - Create personalization session (for brand new custom checks/forms)
 * - Generate edit URL
 * - Receive Design ID
 *
 * NOTE: As required by architecture guidelines, this layer communicates ONLY with the B2C platform
 * and never modifies raw graphic artwork itself.
 */

export interface PersonalizationSession {
  success: boolean;
  designId?: string;
  editUrl?: string;
  previewUrl?: string;
  sessionToken?: string;
  expiresAt?: string;
  message?: string;
}

export interface DesignCloneResult {
  success: boolean;
  previousDesignId: string;
  newDesignId?: string;
  editUrl?: string;
  message?: string;
}

export interface IPersonalizationProvider {
  /**
   * Scenario 1: Create a brand new design session for a product (e.g. computer checks).
   * Generates a Design ID and returns an interactive iframe/studio edit URL.
   */
  createSession(
    productId: string,
    customerEmail?: string,
    customizations?: Record<string, any>,
  ): Promise<PersonalizationSession>;

  /**
   * Scenario 3: Retrieve an existing design from a past order and generate an edit URL
   * so the customer can modify business info (address, phone numbers, logos) prior to checking out.
   */
  getEditSessionForPreviousDesign(
    previousDesignId: string,
    customerEmail?: string,
  ): Promise<PersonalizationSession>;

  /**
   * Clone a previous design into a new unique Design ID without altering the original order artwork.
   */
  duplicateDesign(previousDesignId: string): Promise<DesignCloneResult>;

  /**
   * Check if the B2C personalization engine is accessible.
   */
  isAvailable(): Promise<boolean>;
}
