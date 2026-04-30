import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("families")
export class Family {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", unique: true })
  inviteCode!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
