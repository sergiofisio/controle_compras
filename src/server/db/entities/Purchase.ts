import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  familyId!: string;

  @Column({ type: "varchar" })
  storeName!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
