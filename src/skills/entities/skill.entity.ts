import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Worker } from '../../workers/entities/worker.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Worker, (worker: Worker) => worker.skills)
  workers: Worker[];
}
