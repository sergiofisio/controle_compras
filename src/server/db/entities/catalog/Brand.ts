import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "uuid", nullable: true })
  familyId!: string | null;

  @Column({ type: "boolean", default: false })
  isGlobal!: boolean;

  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
