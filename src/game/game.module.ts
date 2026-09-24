import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomPlayer } from './entities/room-player.entity';
import { Room } from './entities/room.entity';
import { Player } from './entities/player.entity';
import { Round } from './entities/round.entity';
import { Vote } from './entities/vote.entity';
import { GameService } from './game.service';
import { WordPair } from './entities/word-pair.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Room, RoomPlayer, Round, Vote, WordPair]),
  ],
  providers: [GameGateway, GameService],
})
export class GameModule {}
