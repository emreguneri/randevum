import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("payment_methods")
export class PaymentMethod {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 20 })
  provider: "mock" | "iyzico";

  @Column({ type: "varchar", length: 255 })
  token: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  brand: string | null;

  @Column({ type: "varchar", length: 4, nullable: true })
  last4: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

