import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Trip } from "./trip.entity";

export type DisputeStatus = "OPEN" | "RESOLVED" | "REJECTED";

@Entity("disputes")
export class Dispute {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tripId: string;

  @ManyToOne(() => Trip)
  @JoinColumn({ name: "trip_id" })
  trip: Trip;

  @Column({ type: "varchar", length: 20 })
  status: DisputeStatus;

  @Column({ type: "integer", nullable: true })
  amountKurus: number | null;

  @Column({ type: "text", nullable: true })
  reason: string | null;

  @Column({ type: "text", nullable: true })
  resolution: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

