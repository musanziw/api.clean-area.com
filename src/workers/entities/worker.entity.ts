import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'longtext' })
  about: string;

  @ManyToOne(() => User, (user: User) => user.added_workers, {
    cascade: true,
  })
  added_by: User;

  @ManyToMany(() => Skill, (skill: Skill) => skill.workers, {
    cascade: true,
  })
  @JoinTable()
  skills: Skill[];

  @ManyToMany(() => Image, (image: Image) => image.workers, {
    cascade: true,
  })
  @JoinTable()
  images: Image[];
}
