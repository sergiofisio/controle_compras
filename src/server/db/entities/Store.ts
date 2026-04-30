import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  type!: string;

  @Column({ type: "uuid" })
  familyId!: string;
}
