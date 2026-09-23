import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';

@Entity('rounds')
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Room)
  room!: Room;

  @Column()
  roundNumber!: number;

  @Column({ length: 100 })
  word!: string;

  @Column({ length: 100 })
  spyWord!: string;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ nullable: true })
  endedAt!: Date;
}
