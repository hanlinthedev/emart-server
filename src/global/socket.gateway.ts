import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  private readonly socketServer: Server;
  private readonly clients: Map<string, string> = new Map();
  constructor(private readonly authService: AuthService) {}
  handleConnection(socket: Socket) {
    const socketId = socket.id;
    const token = socket.handshake.auth.token;
    const payload = this.authService.verifyJwt(token);
    console.log('payload', payload);
    this.clients.set(payload.id, socketId);
  }

  emitToClient(eventType: any, userId: string) {
    this.socketServer.to(userId).emit(eventType);
  }
}
