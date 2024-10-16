import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private clients = new Map<string, Subject<MessageEvent>>(); // Track clients by ID

  // Add a new client connection
  addClient(clientId: string): Observable<MessageEvent> {
    let subject = this.clients.get(clientId);
    if (!subject) {
      subject = new Subject<MessageEvent>();
      this.clients.set(clientId, subject);
    }

    return subject.asObservable();
  }

  // Remove a client connection (cleanup)
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  // Emit event to a specific client
  emitToClient(clientId: string, data: any): void {
    const subject = this.clients.get(clientId);
    console.log(subject, data);
    if (subject) {
      subject.next(new MessageEvent('message', { data }));
    }
  }

  // Emit event to all clients (broadcast)
  emitToAll(data: any): void {
    this.clients.forEach((subject) => {
      subject.next(new MessageEvent('message', { data }));
    });
  }
}
