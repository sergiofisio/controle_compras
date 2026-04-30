import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("access_logs")
export class AccessLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  @Column({ type: "varchar" })
  action!: string;

  @Column({ type: "varchar", nullable: true })
  email!: string | null;

  @Column({ type: "varchar", nullable: true })
  ip!: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
