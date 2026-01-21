import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Trip } from "./trip.entity";
import type { TripStatus } from "@arabanla-eve/shared";

@Entity("trip_events")
export class TripEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tripId: string;

  @ManyToOne(() => Trip, (trip) => trip.events)
  @JoinColumn({ name: "trip_id" })
  trip: Trip;

  @Column({ type: "varchar", length: 20 })
  status: TripStatus;

  @Column({ type: "varchar", length: 20 })
  actor: "SYSTEM" | "USER" | "DRIVER" | "ADMIN";

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

