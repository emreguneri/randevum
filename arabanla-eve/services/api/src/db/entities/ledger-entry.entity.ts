import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Trip } from "./trip.entity";

export type AccountType = "USER" | "PLATFORM" | "DRIVER";

@Entity("ledger_entries")
export class LedgerEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true })
  tripId: string | null;

  @ManyToOne(() => Trip, { nullable: true })
  @JoinColumn({ name: "trip_id" })
  trip: Trip | null;

  @Column({ type: "varchar", length: 20 })
  account: AccountType;

  @Column({ type: "integer" })
  amountKurus: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

