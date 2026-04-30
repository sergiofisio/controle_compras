import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("price_history")
export class PriceHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  productName!: string;

  @Column({ type: "varchar" })
  storeName!: string;

  @Column("float")
  price!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
