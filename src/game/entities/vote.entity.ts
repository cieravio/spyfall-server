import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Round } from './round.entity';
import { Player } from './player.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Round)
  round!: Round;

  @ManyToOne(() => Player)
  voter!: Player;

  @ManyToOne(() => Player)
  votedFor!: Player;

  @CreateDateColumn()
  createdAt!: Date;
}
