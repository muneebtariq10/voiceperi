import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderStatusMappingService {
  mapStatus(internalStatus: string, historyComment?: string | null): string {
    if (historyComment && historyComment.includes('Address not found or not deliverable')) {
      return 'The order could not proceed because the delivery address could not be verified. Please confirm the address or contact customer support.';
    }

    if (!internalStatus || internalStatus.trim() === '') {
      return 'I could not confirm the current order status. Customer support will need to review the order.';
    }

    switch (internalStatus.trim()) {
      case 'Incomplete / Abandoned Checkout':
        return 'Your checkout was not completed, so the order has not yet been confirmed.';
      case 'TESTING':
        return 'This order currently has an internal status that requires review by customer support. Shipment cannot be confirmed from the available information.';
      default:
        // Default safe fallback if we don't know the status
        return `The current status is ${internalStatus}.`;
    }
  }

  mapHistoryComment(comment: string): string | null {
    if (!comment) return null;
    
    // Remove HTML tags
    let sanitized = comment.replace(/<[^>]*>?/gm, '').trim();

    // Redact payment IDs
    sanitized = sanitized.replace(/pm[a-zA-Z0-9]+/g, '[REDACTED_PAYMENT_ID]');
    
    // Ignore internal staff "Viewed Order" or empty comments
    if (sanitized === 'Viewed Order' || sanitized === '') {
      return null;
    }

    return sanitized;
  }
}
