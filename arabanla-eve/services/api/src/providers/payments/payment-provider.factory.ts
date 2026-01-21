import { Config } from "../../config/env";
import { PaymentProvider } from "./payment-provider.interface";
import { MockPaymentProvider } from "./mock/mock-payment.provider";
import { IyzicoPaymentProvider } from "./iyzico/iyzico-payment.provider";

export function createPaymentProvider(): PaymentProvider {
  if (Config.paymentProvider === "iyzico") {
    return new IyzicoPaymentProvider();
  }
  return new MockPaymentProvider();
}

