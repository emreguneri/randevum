import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Driver } from "./driver.entity";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "ON_HOLD";

@Entity("payouts")
export class Payout {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  driverId: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: "driver_id" })
  driver: Driver;

  @Column({ type: "integer" })
  amountKurus: number;

  @Column({ type: "varchar", length: 20 })
  status: PayoutStatus;

  @Column({ type: "timestamptz", nullable: true })
  scheduledAt: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

