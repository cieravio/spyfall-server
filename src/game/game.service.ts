import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { RoomPlayer } from './entities/room-player.entity';
import { WordPair } from './entities/word-pair.entity';
import { Round } from './entities/round.entity';

@Injectable()
export class GameService {
  private queue: { socketId: string; username: string }[] = [];

  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(RoomPlayer)
    private roomPlayerRepository: Repository<RoomPlayer>,
    @InjectRepository(Round)
    private roundRepository: Repository<Round>,
    @InjectRepository(WordPair)
    private wordPairRepository: Repository<WordPair>,
  ) {}

  async joinQueue(socketId: string, username: string) {
    const exists = this.queue.find((p) => p.socketId === socketId);
    if (exists) return null;

    this.queue.push({ socketId, username });

    if (this.queue.length >= 8) {
      return await this.createRoom();
    }

    return { waiting: true, queueCount: this.queue.length };
  }

  private async createRoom() {
    const players = this.queue.splice(0, 8);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const room = this.roomRepository.create({ code });
    await this.roomRepository.save(room);

    const roomPlayers: {
      socketId: string;
      username: string;
      playerId: string;
    }[] = [];
    for (const p of players) {
      const player = this.playerRepository.create({ username: p.username });
      await this.playerRepository.save(player);

      const roomPlayer = this.roomPlayerRepository.create({
        room,
        player,
        isSpy: false,
      });
      await this.roomPlayerRepository.save(roomPlayer);
      roomPlayers.push({ ...p, playerId: player.id });
    }

    const totalPlayers = roomPlayers.length;
    const spyCount = Math.floor(totalPlayers / 3);

    const spyIndexes = new Set<number>();
    while (spyIndexes.size < spyCount) {
      const randomIndex = Math.floor(Math.random() * totalPlayers);
      spyIndexes.add(randomIndex);
    }

    const spySocketIds: string[] = [];

    for (const index of spyIndexes) {
      const spy = roomPlayers[index];
      spySocketIds.push(spy.socketId);

      await this.roomPlayerRepository.update(
        { room: { id: room.id }, player: { id: spy.playerId } },
        { isSpy: true },
      );
    }

    return {
      roomId: room.id,
      code,
      players: roomPlayers,
      spySocketIds,
    };
  }

  leaveQueue(socketId: string) {
    this.queue = this.queue.filter((p) => p.socketId !== socketId);
  }

  getQueueSocketIds(): string[] {
    return this.queue.map((p) => p.socketId);
  }

  async generateRound(
    roomId: string,
    roundNumber: number,
  ): Promise<{
    round: Round;
    commonWord: string;
    spyWord: string;
  }> {
    const pairs = await this.wordPairRepository.find();
    if (!pairs.length) throw new Error('No word pairs found');

    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    const coinFlip = Math.random() < 0.5;
    const commonWord = coinFlip ? pair.wordA : pair.wordB;
    const spyWord = coinFlip ? pair.wordB : pair.wordA;

    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');

    const round = this.roundRepository.create({
      room,
      roundNumber,
      word: commonWord,
      spyWord: spyWord,
    });
    await this.roundRepository.save(round);

    return { round, commonWord, spyWord };
  }
}
