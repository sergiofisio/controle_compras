import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("user_phones")
export class UserPhone {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 3 })
  countryCode!: string;

  @Column({ type: "varchar", length: 8 })
  areaCode!: string;

  @Column({ type: "varchar", length: 20 })
  phone!: string;

  @Column({ type: "varchar", default: "MOBILE" })
  type!: "MOBILE" | "WORK" | "HOME" | "OTHER";

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
