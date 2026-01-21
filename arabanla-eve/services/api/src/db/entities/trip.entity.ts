import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Driver } from "./driver.entity";
import { TripEvent } from "./trip-event.entity";
import { Payment } from "./payment.entity";
import type { TripStatus, PaymentStatus, TripMode, TimeMode } from "@arabanla-eve/shared";

@Entity("trips")
export class Trip {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "uuid", nullable: true })
  driverId: string | null;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: "driver_id" })
  driver: Driver | null;

  @Column({ type: "varchar", length: 20 })
  status: TripStatus;

  @Column({ type: "varchar", length: 20, default: "NONE" })
  paymentStatus: PaymentStatus;

  @Column({ type: "varchar", length: 20 })
  mode: TripMode;

  @Column({ type: "varchar", length: 20 })
  timeMode: TimeMode;

  @Column({ type: "integer" })
  pricingVersion: number;

  @Column({ type: "numeric", nullable: true })
  estimatedDistanceKm: number | null;

  @Column({ type: "numeric", nullable: true })
  estimatedDurationMin: number | null;

  @Column({ type: "numeric", nullable: true })
  actualDistanceKm: number | null;

  @Column({ type: "numeric", nullable: true })
  waitingMinutes: number | null;

  @Column({ type: "integer", nullable: true })
  fareKurus: number | null;

  @Column({ type: "integer", nullable: true })
  platformFeeKurus: number | null;

  @Column({ type: "integer", nullable: true })
  driverEarningsKurus: number | null;

  @Column({ type: "double precision", nullable: true })
  pickupLat: number | null;

  @Column({ type: "double precision", nullable: true })
  pickupLng: number | null;

  @Column({ type: "double precision", nullable: true })
  dropoffLat: number | null;

  @Column({ type: "double precision", nullable: true })
  dropoffLng: number | null;

  @Column({ type: "timestamptz", nullable: true })
  scheduledAt: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToMany(() => TripEvent, (event) => event.trip)
  events: TripEvent[];

  @OneToMany(() => Payment, (payment) => payment.trip)
  payments: Payment[];
}

