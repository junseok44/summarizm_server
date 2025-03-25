import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}
