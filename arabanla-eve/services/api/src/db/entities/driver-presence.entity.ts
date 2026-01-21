import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Driver } from "./driver.entity";

@Entity("driver_presence")
export class DriverPresence {
  @PrimaryColumn({ type: "uuid" })
  driverId: string;

  @ManyToOne(() => Driver, (driver) => driver.presence)
  @JoinColumn({ name: "driver_id" })
  driver: Driver;

  @Column({ type: "boolean", default: false })
  isOnline: boolean;

  @Column({ type: "double precision", nullable: true })
  lat: number | null;

  @Column({ type: "double precision", nullable: true })
  lng: number | null;

  @Column({ type: "timestamptz", default: () => "now()" })
  lastSeen: Date;
}

