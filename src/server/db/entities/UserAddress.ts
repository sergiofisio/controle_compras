import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("user_addresses")
export class UserAddress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 2 })
  country!: string;

  @Column({ type: "varchar", nullable: true })
  zipcode!: string | null;

  @Column({ type: "varchar" })
  street!: string;

  @Column({ type: "varchar", nullable: true })
  neighbour!: string | null;

  @Column({ type: "varchar", nullable: true })
  number!: string | null;

  @Column({ type: "varchar", nullable: true })
  complement!: string | null;

  @Column({ type: "varchar" })
  city!: string;

  @Column({ type: "varchar", nullable: true })
  state!: string | null;

  @Column({ type: "varchar", nullable: true })
  reference!: string | null;

  @Column({ type: "varchar", default: "HOME" })
  type!: "HOME" | "WORK" | "OTHER";

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
