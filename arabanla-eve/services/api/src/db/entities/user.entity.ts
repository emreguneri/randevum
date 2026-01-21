import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 20, unique: true })
  phone: string;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;
}

