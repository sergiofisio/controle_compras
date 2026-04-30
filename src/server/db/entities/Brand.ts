import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @Column({ type: "uuid", nullable: true })
  familyId!: string | null;

  @Column({ type: "boolean", default: false })
  isGlobal!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
