/**
 * PayPal Payment Service - Multi-Provider Architecture
 * 
 * This service handles PayPal-specific client-side operations.
 * It works alongside the backend's PayPalProvider (paymentStrategyService.ts)
 * for a complete multi-provider payment solution.
 * 
 * Documentation:
 * - PayPal JS SDK: https://developer.paypal.com/sdk/js/
 * - React PayPal SDK: https://github.com/paypal/react-paypal-js
 * 
 * Note: Most PayPal operations are handled server-side via the backend.
 * This service is primarily for client-side SDK initialization and utilities.
 */

import { config } from "../lib/config";

// Re-export credit packages for consistency
export { CREDIT_PACKAGES, type CreditPackage } from './MercadoPagoService';

export interface PayPalConfig {
  clientId: string;
  currency: string;
  intent: 'capture' | 'authorize';
  components: string[];
}

/**
 * PayPal SDK initialization options
 */
export interface PayPalInitOptions {
  currency?: string;
  intent?: 'capture' | 'authorize';
  enableFunding?: string[];
  disableFunding?: string[];
}

class PayPalService {
  private clientId: string;
  private isProduction: boolean;

  constructor() {
    this.clientId = config.paypalClientId;
    this.isProduction = config.isProduction;

    console.log('💳 PayPal Service initialized:', {
      environment: config.env,
      isProduction: this.isProduction,
      clientId: this.clientId ? `${this.clientId.slice(0, 20)}...` : 'NOT SET',
    });
  }

  /**
   * Check if PayPal is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.clientId);
  }

  /**
   * Get PayPal client ID for SDK initialization
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Get PayPal SDK configuration options
   * Used for initializing the PayPal SDK in React components
   */
  getSDKConfig(options: PayPalInitOptions = {}): PayPalConfig {
    return {
      clientId: this.clientId,
      currency: options.currency || 'USD',
      intent: options.intent || 'capture',
      components: ['buttons', 'hosted-fields'],
    };
  }

  /**
   * Get PayPal SDK script URL
   * Can be used for manual script loading if not using @paypal/react-paypal-js
   */
  getScriptUrl(options: PayPalInitOptions = {}): string {
    const params = new URLSearchParams({
      'client-id': this.clientId,
      currency: options.currency || 'USD',
      intent: options.intent || 'capture',
      components: 'buttons,hosted-fields',
    });

    if (options.enableFunding?.length) {
      params.set('enable-funding', options.enableFunding.join(','));
    }

    if (options.disableFunding?.length) {
      params.set('disable-funding', options.disableFunding.join(','));
    }

    return `https://www.paypal.com/sdk/js?${params.toString()}`;
  }

  /**
   * Map PayPal status to standardized payment status
   */
  mapPayPalStatus(paypalStatus: string): 'approved' | 'pending' | 'rejected' | 'cancelled' | 'unknown' {
    const statusMap: Record<string, 'approved' | 'pending' | 'rejected' | 'cancelled' | 'unknown'> = {
      'COMPLETED': 'approved',
      'APPROVED': 'approved',
      'CAPTURED': 'approved',
      'PENDING': 'pending',
      'CREATED': 'pending',
      'SAVED': 'pending',
      'PAYER_ACTION_REQUIRED': 'pending',
      'VOIDED': 'cancelled',
      'DECLINED': 'rejected',
      'FAILED': 'rejected',
    };

    return statusMap[paypalStatus?.toUpperCase()] || 'unknown';
  }

  /**
   * Format PayPal error message for user display
   */
  formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    // PayPal SDK error structure
    if (error?.details?.[0]?.description) {
      return error.details[0].description;
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected payment error occurred. Please try again.';
  }

  /**
   * Log PayPal event for debugging
   */
  logEvent(event: string, data?: any): void {
    if (!this.isProduction) {
      console.log(`🔵 PayPal ${event}:`, data);
    }
  }
}

const payPalService = new PayPalService();
export default payPalService;
