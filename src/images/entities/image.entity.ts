import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Worker } from '../../workers/entities/worker.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  thumb: string;

  @ManyToMany(() => Worker, (worker: Worker) => worker.images)
  workers: Worker[];

  @ManyToMany(() => User, (user: User) => user.images)
  users: User[];
}
