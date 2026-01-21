export interface PaymentMethod {
  id: string;
  userId: string;
  provider: "mock" | "iyzico";
  token: string;
  brand?: string;
  last4?: string;
  createdAt: string;
}

export interface PaymentAuthorization {
  id: string;
  amountKurus: number;
  provider: "mock" | "iyzico";
  status: "AUTHORIZED" | "DECLINED";
  raw?: any;
}

export interface PaymentCapture {
  id: string;
  amountKurus: number;
  provider: "mock" | "iyzico";
  status: "CAPTURED" | "FAILED";
  raw?: any;
}

