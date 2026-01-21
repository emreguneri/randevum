import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { DriverPresence } from "./driver-presence.entity";

export type DriverStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

@Entity("drivers")
export class Driver {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 20, default: "PENDING" })
  status: DriverStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  submerchantKey: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToOne(() => DriverPresence, (presence) => presence.driver)
  presence: DriverPresence;
}

