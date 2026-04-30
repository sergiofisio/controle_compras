import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("purchase_items")
export class PurchaseItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  purchaseId!: string;

  @Column({ type: "varchar" })
  productName!: string;

  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @Column({ type: "uuid", nullable: true })
  brandId!: string | null;

  @Column({ type: "varchar", default: "unidade" })
  unit!: string;

  @Column("float")
  price!: number;

  @Column("int", { default: 1 })
  quantity!: number;

  @Column({ type: "varchar", default: "none" })
  discountType!: "none" | "percent" | "bulk";

  @Column("float", { nullable: true })
  discountPercent!: number | null;

  @Column("int", { nullable: true })
  promoQty!: number | null;

  @Column("float", { nullable: true })
  promoPrice!: number | null;

  @Column("float", { default: 0 })
  lineTotal!: number;

  @Column("float", { default: 0 })
  finalUnitPrice!: number;
}
