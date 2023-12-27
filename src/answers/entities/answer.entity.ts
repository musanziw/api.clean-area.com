import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from '../../questions/entities/question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext' })
  content: string;

  @ManyToOne(() => Question, (question) => question.answers, {
    cascade: true,
  })
  question: Question;
}
