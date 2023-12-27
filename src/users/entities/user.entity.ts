import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Question } from '../../questions/entities/question.entity';
import { Image } from '../../images/entities/image.entity';
import { Worker } from '../../workers/entities/worker.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  reset_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Role, (role: Role) => role.users, {
    cascade: true,
  })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Question, (question: Question) => question.user)
  questions: Question[];

  @OneToMany(() => Worker, (worker: Worker) => worker.added_by)
  added_workers: Worker[];

  @ManyToMany(() => Image, (image: Image) => image.users, {
    cascade: true,
  })
  @JoinTable()
  images: Image[];
}
