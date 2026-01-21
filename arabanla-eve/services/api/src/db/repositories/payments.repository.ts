import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment, PaymentStatus } from "../entities/payment.entity";

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  async findByTripId(tripId: string): Promise<Payment[]> {
    return this.repo.find({
      where: { tripId },
      order: { createdAt: "ASC" },
    });
  }

  async findAuthorizationByTripId(tripId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { tripId, status: "AUTHORIZED" },
    });
  }

  async create(data: {
    tripId: string;
    provider: "mock" | "iyzico";
    status: PaymentStatus;
    amountKurus: number;
    authId?: string;
    captureId?: string;
  }): Promise<Payment> {
    const payment = this.repo.create(data);
    return this.repo.save(payment);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async updateCaptureId(id: string, captureId: string): Promise<void> {
    await this.repo.update({ id }, { captureId, status: "CAPTURED" });
  }
}

