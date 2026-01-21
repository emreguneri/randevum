import { PaymentProvider } from "../payment-provider.interface";
import { randomUUID } from "crypto";

export class MockPaymentProvider implements PaymentProvider {
  async authorize(amountKurus: number) {
    return {
      authId: `mock-auth-${randomUUID()}`,
      status: "AUTHORIZED" as const,
    };
  }

  async capture(authId: string, amountKurus: number) {
    return {
      captureId: `mock-capture-${authId}`,
      status: "CAPTURED" as const,
    };
  }

  async void(_authId: string): Promise<void> {
    return;
  }

  async refund(captureId: string, _amountKurus: number) {
    return {
      refundId: `mock-refund-${captureId}`,
      status: "REFUNDED" as const,
    };
  }

  async payout(submerchantId: string, _amountKurus: number) {
    return {
      payoutId: `mock-payout-${submerchantId}`,
      status: "PAID" as const,
    };
  }
}

