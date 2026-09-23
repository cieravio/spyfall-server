import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 8, unique: true })
  code!: string;

  @Column({ default: 'waiting' })
  status!: 'waiting' | 'playing' | 'finished' | 'lingering';

  @Column({ default: 8 })
  maxPlayers!: number;

  @Column({ default: 5 })
  totalRounds!: number;

  @Column({ default: 0 })
  currentRound!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
