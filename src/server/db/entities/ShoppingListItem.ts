import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("shopping_list_items")
export class ShoppingListItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  listId!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @Column({ type: "uuid", nullable: true })
  brandId!: string | null;

  @Column({ type: "varchar", default: "unidade" })
  unit!: string;

  @Column("int", { default: 1 })
  quantity!: number;

  @Column({ type: "boolean", default: false })
  checked!: boolean;
}
