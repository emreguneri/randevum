export interface PaymentProvider {
  authorize(
    amountKurus: number,
    metadata?: Record<string, any>,
  ): Promise<{ authId: string; status: "AUTHORIZED" | "DECLINED" }>;
  capture(
    authId: string,
    amountKurus: number,
  ): Promise<{ captureId: string; status: "CAPTURED" | "FAILED" }>;
  void(authId: string): Promise<void>;
  refund(
    captureId: string,
    amountKurus: number,
  ): Promise<{ refundId: string; status: "REFUNDED" | "FAILED" }>;
  payout(
    submerchantId: string,
    amountKurus: number,
  ): Promise<{ payoutId: string; status: "PAID" | "FAILED" }>;
}

