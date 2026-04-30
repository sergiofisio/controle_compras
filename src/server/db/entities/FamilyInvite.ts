import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("family_invites")
export class FamilyInvite {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  familyId!: string;

  @Column({ type: "uuid" })
  createdByUserId!: string;

  @Column({ type: "varchar", unique: true })
  inviteCode!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  usedAt!: Date | null;

  @Column({ type: "uuid", nullable: true })
  usedByUserId!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
