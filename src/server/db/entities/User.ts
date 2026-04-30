import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  passwordHash!: string;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", nullable: true })
  avatarUrl!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
