import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { Player } from './player.entity';

@Entity('room_players')
export class RoomPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Room)
  room!: Room;

  @ManyToOne(() => Player)
  player!: Player;

  @Column({ default: false })
  isSpy!: boolean;

  @Column({ default: false })
  isReady!: boolean;

  @CreateDateColumn()
  joinedAt!: Date;
}
