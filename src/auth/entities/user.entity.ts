import { Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  Admin = "admin",
  Viewer = "viewer",
}

export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({enum: Role, default: Role.Viewer})
  role!: Role;
}
