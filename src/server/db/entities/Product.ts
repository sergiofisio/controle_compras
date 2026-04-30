import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  category!: string | null;
}
