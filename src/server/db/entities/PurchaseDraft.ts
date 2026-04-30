import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm";

@Entity("purchase_drafts")
@Unique(["userId", "familyId"])
export class PurchaseDraft {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  familyId!: string;

  @Column({ type: "varchar", nullable: true })
  storeName!: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  cartItems!: unknown[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
