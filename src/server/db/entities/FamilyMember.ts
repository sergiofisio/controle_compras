import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("family_members")
@Unique(["familyId", "userId"])
export class FamilyMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  familyId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", default: "member" })
  role!: "owner" | "member";
}
