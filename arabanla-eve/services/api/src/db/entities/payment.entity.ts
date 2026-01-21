import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Trip } from "./trip.entity";

export type PaymentStatus = "AUTHORIZED" | "CAPTURED" | "VOIDED" | "REFUNDED" | "FAILED";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tripId: string;

  @ManyToOne(() => Trip, (trip) => trip.payments)
  @JoinColumn({ name: "trip_id" })
  trip: Trip;

  @Column({ type: "varchar", length: 20 })
  provider: "mock" | "iyzico";

  @Column({ type: "varchar", length: 20 })
  status: PaymentStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  authId: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  captureId: string | null;

  @Column({ type: "integer" })
  amountKurus: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

