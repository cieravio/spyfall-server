import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Player connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Player disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_queue')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { username: string },
  ) {
    const result = await this.gameService.joinQueue(
      client.id,
      payload.username,
    );

    if (!result) return;

    if ('waiting' in result) {
      const queueSocketIds = this.gameService.getQueueSocketIds();
      for (const socketId of queueSocketIds) {
        const s = this.server.sockets.sockets.get(socketId);
        if (s) s.emit('queue_update', { queueCount: result.queueCount });
      }
      return;
    }

    const { roomId, code, players, spySocketIds } = result;

    for (const p of players) {
      const playerSocket = this.server.sockets.sockets.get(p.socketId);
      if (playerSocket) {
        playerSocket.join(roomId);

        const isSpy = spySocketIds.includes(p.socketId);
        playerSocket.emit('room_joined', {
          roomId,
          code,
          isSpy,
          players: players.map((p1) => ({
            socketId: p1.socketId,
            username: p1.username,
          })),
        });
      }
    }
  }
}
