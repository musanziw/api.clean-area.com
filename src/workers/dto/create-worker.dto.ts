import { IsNotEmpty } from 'class-validator';

export class CreateWorkerDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  about: string;

  @IsNotEmpty()
  skills: number[];
}
