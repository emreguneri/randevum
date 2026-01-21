import { PaymentProvider } from "../payment-provider.interface";

// Stub implementation; wire real iyzico later.
export class IyzicoPaymentProvider implements PaymentProvider {
  async authorize(amountKurus: number) {
    return {
      authId: `iyzico-auth-placeholder`,
      status: "AUTHORIZED" as const,
    };
  }

  async capture(authId: string, amountKurus: number) {
    return {
      captureId: `iyzico-capture-placeholder`,
      status: "CAPTURED" as const,
    };
  }

  async void(_authId: string): Promise<void> {
    return;
  }

  async refund(captureId: string, _amountKurus: number) {
    return {
      refundId: `iyzico-refund-placeholder`,
      status: "REFUNDED" as const,
    };
  }

  async payout(submerchantId: string, _amountKurus: number) {
    return {
      payoutId: `iyzico-payout-placeholder`,
      status: "PAID" as const,
    };
  }
}

