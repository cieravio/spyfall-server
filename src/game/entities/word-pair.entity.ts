import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('word_pairs')
export class WordPair {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  wordA!: string;

  @Column({ length: 100 })
  wordB!: string;
}
