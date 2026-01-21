import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("pricing_configs")
export class PricingConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer", unique: true })
  pricingVersion: number;

  @Column({ type: "integer" })
  taxiKmRateKurus: number;

  @Column({ type: "integer" })
  taxiMinuteRateKurus: number;

  @Column({ type: "integer" })
  kmRateKurus: number;

  @Column({ type: "integer" })
  waitRatePerMinKurus: number;

  @Column({ type: "numeric" })
  commissionRate: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

