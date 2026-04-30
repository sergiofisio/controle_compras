import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("shopping_lists")
export class ShoppingList {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "uuid" })
  familyId!: string;
}
